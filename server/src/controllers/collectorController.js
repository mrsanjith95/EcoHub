import mongoose from 'mongoose';
import WasteReport from '../models/WasteReport.js';
import { inMemoryStore } from '../utils/inMemoryStore.js';

// @desc    Get available/assigned pickup jobs for collector
// @route   GET /api/collector/jobs
// @access  Private (Collector / Admin)
export const getCollectorJobs = async (req, res) => {
  try {
    const { status } = req.query;
    const isMongoConnected = mongoose.connection.readyState === 1;

    let reports = [];

    if (isMongoConnected) {
      const query = {};
      if (status) {
        query.status = status;
      } else {
        // Default: return non-completed/non-cancelled active pickup jobs
        query.status = { $in: ['Pending', 'Accepted', 'Collected', 'Delivered'] };
      }

      reports = await WasteReport.find(query)
        .populate('generatorId', 'name email phone address')
        .populate('assignedHubId')
        .sort({ createdAt: -1 });
    } else {
      const filter = {};
      if (status) filter.status = status;
      reports = await inMemoryStore.getWasteReports(filter);
    }

    return res.json({ count: reports.length, jobs: reports });
  } catch (error) {
    console.error('Get collector jobs error:', error);
    return res.status(500).json({ error: 'Failed to fetch collector pickup jobs' });
  }
};
