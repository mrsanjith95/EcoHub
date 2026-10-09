import mongoose from 'mongoose';
import User from '../models/User.js';
import WasteReport from '../models/WasteReport.js';
import ProcessingHub from '../models/ProcessingHub.js';
import ProcessingRecord from '../models/ProcessingRecord.js';
import { inMemoryStore } from '../utils/inMemoryStore.js';

// @desc    Get system-wide overview statistics for admin
// @route   GET /api/admin/overview
// @access  Private (Admin)
export const getAdminOverview = async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const totalUsers = await User.countDocuments();
      const totalReports = await WasteReport.countDocuments();
      const pendingReports = await WasteReport.countDocuments({ status: 'Pending' });
      const completedReports = await WasteReport.countDocuments({ status: 'Completed' });
      const totalHubs = await ProcessingHub.countDocuments();
      const activeHubs = await ProcessingHub.countDocuments({ status: 'active' });

      // Processing Record Totals
      const processingAgg = await ProcessingRecord.aggregate([
        {
          $group: {
            _id: null,
            totalProcessedKg: { $sum: '$processedQuantityKg' },
            totalRecycledKg: { $sum: '$recycledQuantityKg' },
            totalCompostedKg: { $sum: '$compostedQuantityKg' },
            totalRecoveredKg: { $sum: '$recoveredQuantityKg' },
            totalLandfillDivertedKg: { $sum: '$landfillDivertedKg' },
          },
        },
      ]);

      const totals = processingAgg[0] || {
        totalProcessedKg: 0,
        totalRecycledKg: 0,
        totalCompostedKg: 0,
        totalRecoveredKg: 0,
        totalLandfillDivertedKg: 0,
      };

      // Recent Waste Reports
      const recentReports = await WasteReport.find()
        .populate('generatorId', 'name email')
        .populate('assignedHubId', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

      // Active Hubs List
      const activeHubsList = await ProcessingHub.find({ status: 'active' }).limit(5);

      // User Role Distribution
      const roleAgg = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
          },
        },
      ]);

      const userRoleDistribution = roleAgg.map((r) => ({
        role: r._id,
        count: r.count,
      }));

      return res.json({
        totalUsers,
        totalReports,
        pendingReports,
        completedReports,
        totalHubs,
        activeHubs,
        totalCollectedKg: Math.round(totals.totalProcessedKg * 10) / 10,
        totalProcessedKg: Math.round(totals.totalProcessedKg * 10) / 10,
        totalRecycledKg: Math.round(totals.totalRecycledKg * 10) / 10,
        totalCompostedKg: Math.round(totals.totalCompostedKg * 10) / 10,
        totalRecoveredKg: Math.round(totals.totalRecoveredKg * 10) / 10,
        totalLandfillDivertedKg: Math.round(totals.totalLandfillDivertedKg * 10) / 10,
        recentReports,
        activeHubsList,
        userRoleDistribution,
      });
    } else {
      const overview = await inMemoryStore.getAdminOverview();
      return res.json(overview);
    }
  } catch (error) {
    console.error('Get admin overview error:', error);
    return res.status(500).json({ error: 'Failed to fetch admin overview' });
  }
};
