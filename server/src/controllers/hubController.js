import mongoose from 'mongoose';
import ProcessingHub from '../models/ProcessingHub.js';
import WasteReport from '../models/WasteReport.js';
import ProcessingRecord from '../models/ProcessingRecord.js';
import { inMemoryStore } from '../utils/inMemoryStore.js';
import { calculateHaversineDistance } from '../utils/distance.js';

// @desc    Get all active processing hubs
// @route   GET /api/hubs
// @access  Public
export const getHubs = async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;
    let hubs = [];

    if (isMongoConnected) {
      hubs = await ProcessingHub.find({ status: 'active' });
    } else {
      hubs = await inMemoryStore.getHubs();
    }

    return res.json({ hubs });
  } catch (error) {
    console.error('Get hubs error:', error);
    return res.status(500).json({ error: 'Failed to fetch processing hubs' });
  }
};

// @desc    Get nearby processing hubs sorted by Haversine distance
// @route   GET /api/hubs/nearby
// @access  Public
export const getNearbyHubs = async (req, res) => {
  try {
    const { lat, lng, category } = req.query;

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({ error: 'Valid latitude (lat) and longitude (lng) query parameters are required' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;
    let hubs = [];

    if (isMongoConnected) {
      const query = { status: 'active' };
      if (category) {
        query.acceptedCategories = category;
      }
      const rawHubs = await ProcessingHub.find(query);
      hubs = rawHubs.map((hub) => {
        const dist = calculateHaversineDistance(
          userLat,
          userLng,
          hub.location.latitude,
          hub.location.longitude
        );
        return {
          ...hub.toObject(),
          distanceKm: dist,
        };
      }).sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      hubs = await inMemoryStore.getNearbyHubs(userLat, userLng, category);
    }

    return res.json({
      query: { lat: userLat, lng: userLng, category: category || 'all' },
      count: hubs.length,
      hubs,
    });
  } catch (error) {
    console.error('Get nearby hubs error:', error);
    return res.status(500).json({ error: 'Failed to search nearby hubs' });
  }
};

// @desc    Get processing hub details by ID
// @route   GET /api/hubs/:id
// @access  Public
export const getHubById = async (req, res) => {
  try {
    const { id } = req.params;
    const isMongoConnected = mongoose.connection.readyState === 1;

    let hub = null;
    if (isMongoConnected) {
      hub = await ProcessingHub.findById(id);
    } else {
      hub = await inMemoryStore.getHubById(id);
    }

    if (!hub) {
      return res.status(404).json({ error: 'Processing hub not found' });
    }

    return res.json({ hub });
  } catch (error) {
    console.error('Get hub by id error:', error);
    return res.status(500).json({ error: 'Failed to fetch processing hub details' });
  }
};

// @desc    Get incoming waste shipments assigned to a specific hub
// @route   GET /api/hubs/:id/incoming
// @access  Private (Hub Operator / Admin)
export const getIncomingWaste = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const isMongoConnected = mongoose.connection.readyState === 1;

    let reports = [];
    if (isMongoConnected) {
      const query = { assignedHubId: id };
      if (status) query.status = status;

      reports = await WasteReport.find(query)
        .populate('generatorId', 'name email phone address')
        .sort({ createdAt: -1 });
    } else {
      const filter = { hubId: id };
      if (status) filter.status = status;
      reports = await inMemoryStore.getWasteReports(filter);
    }

    return res.json({ count: reports.length, reports });
  } catch (error) {
    console.error('Get incoming waste error:', error);
    return res.status(500).json({ error: 'Failed to fetch incoming waste for hub' });
  }
};

// @desc    Process waste & create ProcessingRecord
// @route   POST /api/hubs/:id/process
// @access  Private (Hub Operator)
export const processWaste = async (req, res) => {
  try {
    const { id: hubId } = req.params;
    const {
      wasteReportId,
      category,
      inputQuantityKg,
      processedQuantityKg,
      processingMethod,
      recycledQuantityKg = 0,
      compostedQuantityKg = 0,
      recoveredQuantityKg = 0,
      landfillDivertedKg = 0,
      notes = '',
    } = req.body;

    const inputKg = parseFloat(inputQuantityKg);
    const processedKg = parseFloat(processedQuantityKg);
    const recycledKg = parseFloat(recycledQuantityKg) || 0;
    const compostedKg = parseFloat(compostedQuantityKg) || 0;
    const recoveredKg = parseFloat(recoveredQuantityKg) || 0;
    const divertedKg = parseFloat(landfillDivertedKg) || 0;

    // 1. Validation checks
    if (!wasteReportId || !processingMethod || isNaN(inputKg) || isNaN(processedKg)) {
      return res.status(400).json({ error: 'wasteReportId, processingMethod, inputQuantityKg, and processedQuantityKg are required' });
    }

    if (inputKg < 0 || processedKg < 0 || recycledKg < 0 || compostedKg < 0 || recoveredKg < 0 || divertedKg < 0) {
      return res.status(400).json({ error: 'Quantities cannot be negative numbers' });
    }

    if (processedKg > inputKg) {
      return res.status(400).json({ error: 'Processed quantity cannot exceed input quantity' });
    }

    if (recycledKg + compostedKg + recoveredKg > inputKg) {
      return res.status(400).json({ error: 'Sum of recycled, composted, and recovered quantities cannot exceed input quantity' });
    }

    if (divertedKg > inputKg) {
      return res.status(400).json({ error: 'Landfill diverted quantity cannot exceed input quantity' });
    }

    const ALLOWED_METHODS = ['Recycled', 'Composted', 'Recovered', 'Sent for further treatment'];
    if (!ALLOWED_METHODS.includes(processingMethod)) {
      return res.status(400).json({ error: `Invalid processing method. Allowed: ${ALLOWED_METHODS.join(', ')}` });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    let record;
    if (isMongoConnected) {
      const report = await WasteReport.findById(wasteReportId);
      if (!report) {
        return res.status(404).json({ error: 'Waste report not found' });
      }

      const assignedId = typeof report.assignedHubId === 'object' && report.assignedHubId !== null
        ? (report.assignedHubId._id || report.assignedHubId.id)
        : report.assignedHubId;

      if (assignedId && String(assignedId) !== String(hubId)) {
        return res.status(403).json({ error: 'This waste report is not assigned to your processing hub' });
      }

      const hub = await ProcessingHub.findById(hubId);
      if (!hub) {
        return res.status(404).json({ error: 'Processing hub not found' });
      }

      // Create Processing Record
      record = await ProcessingRecord.create({
        wasteReportId,
        hubId,
        category: category || report.category,
        inputQuantityKg: inputKg,
        processedQuantityKg: processedKg,
        processingMethod,
        recycledQuantityKg: recycledKg,
        compostedQuantityKg: compostedKg,
        recoveredQuantityKg: recoveredKg,
        landfillDivertedKg: divertedKg,
        notes,
      });

      // Update Report status to Completed
      report.status = 'Completed';
      report.timeline.push({
        status: 'Completed',
        updatedBy: req.user._id,
        note: `Waste processing completed (${processingMethod}). Diverted: ${divertedKg} kg. Notes: ${notes}`,
        timestamp: new Date(),
      });
      await report.save();

      // Update Hub stock
      hub.currentStockKg = Math.max(0, (hub.currentStockKg || 0) + inputKg);
      await hub.save();
    } else {
      const report = await inMemoryStore.getWasteReportById(wasteReportId);
      if (!report) {
        return res.status(404).json({ error: 'Waste report not found' });
      }

      const assignedId = typeof report.assignedHubId === 'object' && report.assignedHubId !== null
        ? (report.assignedHubId._id || report.assignedHubId.id)
        : report.assignedHubId;

      if (assignedId && String(assignedId) !== String(hubId)) {
        return res.status(403).json({ error: 'This waste report is not assigned to your processing hub' });
      }

      record = await inMemoryStore.createProcessingRecord(
        {
          wasteReportId,
          hubId,
          category: category || 'Organic',
          inputQuantityKg: inputKg,
          processedQuantityKg: processedKg,
          processingMethod,
          recycledQuantityKg: recycledKg,
          compostedQuantityKg: compostedKg,
          recoveredQuantityKg: recoveredKg,
          landfillDivertedKg: divertedKg,
          notes,
        },
        req.user
      );
    }

    return res.status(201).json({
      message: `Waste report processed successfully via ${processingMethod}`,
      record,
    });
  } catch (error) {
    console.error('Process waste error:', error);
    return res.status(500).json({ error: 'Failed to process waste shipment' });
  }
};
