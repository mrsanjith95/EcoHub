import mongoose from 'mongoose';
import WasteReport from '../models/WasteReport.js';
import ProcessingHub from '../models/ProcessingHub.js';
import { inMemoryStore } from '../utils/inMemoryStore.js';
import { matchBestProcessingHub } from '../utils/hubMatcher.js';
import { calculateHaversineDistance } from '../utils/distance.js';
import { s3Client, bucketName, region } from '../config/s3.js';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ALLOWED_CATEGORIES = ['Organic', 'Plastic', 'Paper', 'Glass', 'Metal', 'E-Waste', 'Mixed Waste'];
const ALLOWED_STATUSES = ['Pending', 'Accepted', 'Collected', 'Delivered', 'Processing', 'Completed', 'Cancelled'];

// Helper to upload image to AWS S3 or Base64 Data URI in local fallback mode
const uploadImageToS3 = async (file, reportId) => {
  if (!file || !file.buffer) return '';

  if (s3Client && process.env.AWS_ACCESS_KEY_ID && bucketName) {
    try {
      const safeFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
      // S3 Object key format: waste-reports/{reportId}/{timestamp}-{safeFileName}
      const fileKey = `waste-reports/${reportId}/${Date.now()}-${safeFileName}`;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);
      const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
      console.log(`[AWS S3 Success] Image uploaded to S3 successfully: ${s3Url}`);
      return s3Url;
    } catch (error) {
      console.error('[AWS S3 Upload Error] Failed to upload image to S3:', error.message);
      throw new Error(`S3 image upload failed: ${error.message}`);
    }
  }

  // Local fallback mode when AWS credentials are not configured:
  // Convert uploaded image buffer to Base64 Data URI so actual uploaded photo displays 100% reliably
  console.log('[AWS S3 Fallback] AWS S3 credentials not configured, storing uploaded photo as Base64 Data URI');
  const base64Data = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${base64Data}`;
};

// Helper to generate presigned GET URL for viewing private S3 image objects securely
const getPresignedImageUrl = async (storedUrlOrKey) => {
  if (!storedUrlOrKey) return '';
  if (storedUrlOrKey.startsWith('data:') || storedUrlOrKey.includes('unsplash.com')) {
    return storedUrlOrKey;
  }
  if (!s3Client || !process.env.AWS_ACCESS_KEY_ID || !bucketName) {
    return storedUrlOrKey;
  }
  try {
    let key = storedUrlOrKey;
    if (storedUrlOrKey.startsWith('http://') || storedUrlOrKey.startsWith('https://')) {
      const urlObj = new URL(storedUrlOrKey);
      key = urlObj.pathname.substring(1); // Remove leading slash
    }
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    // Presigned URL valid for 3600 seconds (1 hour)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return presignedUrl;
  } catch (error) {
    console.warn('[AWS S3 Warning] Could not generate presigned GET URL:', error.message);
    return storedUrlOrKey;
  }
};

// @desc    Create a new waste report with automatic hub matching
// @route   POST /api/waste/reports
// @access  Private (Generator)
export const createWasteReport = async (req, res) => {
  try {
    const { category, quantityKg, description, address, latitude, longitude } = req.body;

    let items = [];
    if (req.body.items) {
      try {
        items = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;
      } catch (e) {
        items = [];
      }
    }

    let reportCategory = '';
    let reportWeight = 0;

    if (Array.isArray(items) && items.length > 0) {
      // Validate each item in multi-category report
      for (const item of items) {
        if (!item.category || !ALLOWED_CATEGORIES.includes(item.category)) {
          return res.status(400).json({
            error: `Invalid waste category '${item.category}'. Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}`,
          });
        }
        const w = parseFloat(item.quantityKg);
        if (isNaN(w) || w <= 0) {
          return res.status(400).json({
            error: `Category '${item.category}' quantity must be a positive number in kg`,
          });
        }
      }

      // Check Mixed Waste mutual exclusivity
      const hasMixed = items.some((i) => i.category === 'Mixed Waste');
      if (hasMixed && items.length > 1) {
        return res.status(400).json({
          error: 'Mixed Waste cannot be combined with individual categories in a single report.',
        });
      }

      reportWeight = items.reduce((sum, i) => sum + parseFloat(i.quantityKg), 0);
      reportCategory = items.length === 1 ? items[0].category : items.map((i) => i.category).join(', ');
    } else {
      // Single category legacy validation
      if (!category || !ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({
          error: `Invalid or unsupported waste category. Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}`,
        });
      }

      const weight = parseFloat(quantityKg);
      if (isNaN(weight) || weight <= 0) {
        return res.status(400).json({ error: 'Quantity in kg must be a positive number' });
      }

      reportCategory = category;
      reportWeight = weight;
      items = [{ category: reportCategory, quantityKg: reportWeight }];
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!address || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Pickup location address, latitude, and longitude are required' });
    }

    const pickupLocation = { address, latitude: lat, longitude: lng };
    const isMongoConnected = mongoose.connection.readyState === 1;

    const generatedId = new mongoose.Types.ObjectId().toString();

    // Handle optional image upload to Amazon S3
    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadImageToS3(req.file, generatedId);
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    let allHubs = [];
    if (isMongoConnected) {
      allHubs = await ProcessingHub.find({ status: 'active' });
    } else {
      allHubs = await inMemoryStore.getHubs();
    }

    // Automatic Processing Hub Matching
    const categoriesForMatching = items.map((i) => i.category);
    const matchedResult = matchBestProcessingHub(allHubs, categoriesForMatching, reportWeight, lat, lng);
    const assignedHubId = matchedResult ? matchedResult.hub._id : null;
    const distanceKm = matchedResult ? matchedResult.distanceKm : null;

    let report;
    if (isMongoConnected) {
      const initialTimeline = [
        {
          status: 'Pending',
          updatedBy: req.user._id,
          note: matchedResult
            ? `Waste report created. Auto-assigned to nearby hub: ${matchedResult.hub.name} (${matchedResult.distanceKm} km).`
            : 'Waste report created. Pending pickup assignment (No suitable nearby hub found currently).',
          timestamp: new Date(),
        },
      ];

      report = await WasteReport.create({
        _id: generatedId,
        generatorId: req.user._id,
        category: reportCategory,
        items,
        quantityKg: reportWeight,
        description: description || '',
        imageUrl,
        pickupLocation,
        status: 'Pending',
        assignedHubId,
        timeline: initialTimeline,
      });

      report = await report.populate('assignedHubId');
    } else {
      report = await inMemoryStore.createWasteReport(
        {
          category: reportCategory,
          items,
          quantityKg: reportWeight,
          description,
          imageUrl,
          pickupLocation,
        },
        req.user
      );
    }

    // Convert imageUrl to presigned URL if present
    const reportObj = isMongoConnected ? report.toObject() : { ...report };
    if (reportObj.imageUrl) {
      reportObj.imageUrl = await getPresignedImageUrl(reportObj.imageUrl);
    }

    return res.status(201).json({
      message: matchedResult
        ? `Waste report submitted successfully and matched with nearby hub (${matchedResult.hub.name} - ${matchedResult.distanceKm} km).`
        : 'Waste report submitted. Note: No suitable processing hub accepting this category was found nearby at present.',
      matchedHub: matchedResult ? matchedResult.hub : null,
      distanceKm,
      report: reportObj,
    });
  } catch (error) {
    console.error('Create waste report error:', error);
    return res.status(500).json({ error: 'Failed to create waste report' });
  }
};

// @desc    Get waste reports (filtered by logged-in user or status)
// @route   GET /api/waste/reports
// @access  Private
export const getWasteReports = async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;
    const { status } = req.query;

    let reports = [];

    if (isMongoConnected) {
      const query = {};
      if (req.user.role === 'generator') {
        query.generatorId = req.user._id;
      }
      if (status) {
        query.status = status;
      }

      const rawReports = await WasteReport.find(query)
        .populate('generatorId', 'name email phone address')
        .populate('assignedHubId')
        .sort({ createdAt: -1 });

      reports = await Promise.all(
        rawReports.map(async (r) => {
          const obj = r.toObject();
          if (obj.imageUrl) {
            obj.imageUrl = await getPresignedImageUrl(obj.imageUrl);
          }
          return obj;
        })
      );
    } else {
      const filter = {};
      if (req.user.role === 'generator') {
        filter.generatorId = req.user._id || req.user.id;
      }
      if (status) filter.status = status;

      const rawReports = await inMemoryStore.getWasteReports(filter);
      reports = await Promise.all(
        rawReports.map(async (r) => {
          const obj = { ...r };
          if (obj.imageUrl) {
            obj.imageUrl = await getPresignedImageUrl(obj.imageUrl);
          }
          return obj;
        })
      );
    }

    return res.json({ count: reports.length, reports });
  } catch (error) {
    console.error('Get waste reports error:', error);
    return res.status(500).json({ error: 'Failed to fetch waste reports' });
  }
};

// @desc    Get single waste report details by ID
// @route   GET /api/waste/reports/:id
// @access  Private
export const getWasteReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const isMongoConnected = mongoose.connection.readyState === 1;

    let report = null;

    if (isMongoConnected) {
      const rawReport = await WasteReport.findById(id)
        .populate('generatorId', 'name email phone address')
        .populate('assignedHubId');
      if (rawReport) {
        report = rawReport.toObject();
        if (report.imageUrl) {
          report.imageUrl = await getPresignedImageUrl(report.imageUrl);
        }
      }
    } else {
      const rawReport = await inMemoryStore.getWasteReportById(id);
      if (rawReport) {
        report = { ...rawReport };
        if (report.imageUrl) {
          report.imageUrl = await getPresignedImageUrl(report.imageUrl);
        }
      }
    }

    if (!report) {
      return res.status(404).json({ error: 'Waste report not found' });
    }

    return res.json({ report });
  } catch (error) {
    console.error('Get waste report details error:', error);
    return res.status(500).json({ error: 'Failed to fetch waste report details' });
  }
};

// @desc    Update status of a waste report
// @route   PATCH /api/waste/reports/:id/status
// @access  Private
export const updateWasteReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Allowed statuses: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;
    let report = null;

    if (isMongoConnected) {
      report = await WasteReport.findById(id);
      if (!report) {
        return res.status(404).json({ error: 'Waste report not found' });
      }

      report.status = status;
      if (req.user.role === 'collector') {
        report.assignedCollectorId = req.user._id;
      }
      report.timeline.push({
        status,
        updatedBy: req.user._id,
        note: note || `Status updated to ${status}`,
        timestamp: new Date(),
      });
      await report.save();
      report = await report.populate('assignedHubId');
      report = report.toObject();
    } else {
      report = await inMemoryStore.updateWasteReportStatus(id, status, req.user, note);
      if (!report) {
        return res.status(404).json({ error: 'Waste report not found' });
      }
    }

    if (report.imageUrl) {
      report.imageUrl = await getPresignedImageUrl(report.imageUrl);
    }

    return res.json({
      message: `Waste report status updated to '${status}' successfully`,
      report,
    });
  } catch (error) {
    console.error('Update waste report status error:', error);
    return res.status(500).json({ error: 'Failed to update waste report status' });
  }
};
