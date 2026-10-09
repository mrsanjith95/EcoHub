import mongoose from 'mongoose';
import WasteReport from '../models/WasteReport.js';
import ProcessingRecord from '../models/ProcessingRecord.js';
import { inMemoryStore } from '../utils/inMemoryStore.js';

// @desc    Get aggregated environmental impact statistics from real database records
// @route   GET /api/impact/stats
// @access  Public
export const getImpactStats = async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      // 1. Calculate total waste collected from reports in active/completed statuses
      const collectedAgg = await WasteReport.aggregate([
        {
          $match: {
            status: { $in: ['Collected', 'Delivered', 'Processing', 'Completed'] },
          },
        },
        {
          $group: {
            _id: null,
            totalCollectedKg: { $sum: '$quantityKg' },
          },
        },
      ]);

      const totalCollectedKg = collectedAgg.length > 0 ? Math.round(collectedAgg[0].totalCollectedKg * 10) / 10 : 0;

      // 2. Aggregate from ProcessingRecords
      const processingAgg = await ProcessingRecord.aggregate([
        {
          $group: {
            _id: null,
            totalProcessedKg: { $sum: '$processedQuantityKg' },
            totalRecycledKg: { $sum: '$recycledQuantityKg' },
            totalCompostedKg: { $sum: '$compostedQuantityKg' },
            totalRecoveredKg: { $sum: '$recoveredQuantityKg' },
            totalLandfillDivertedKg: { $sum: '$landfillDivertedKg' },
            recordsCount: { $sum: 1 },
          },
        },
      ]);

      const totals = processingAgg[0] || {
        totalProcessedKg: 0,
        totalRecycledKg: 0,
        totalCompostedKg: 0,
        totalRecoveredKg: 0,
        totalLandfillDivertedKg: 0,
        recordsCount: 0,
      };

      // 3. Category breakdown
      const categoryAgg = await ProcessingRecord.aggregate([
        {
          $group: {
            _id: '$category',
            quantityKg: { $sum: '$processedQuantityKg' },
          },
        },
      ]);

      const categoryBreakdown = categoryAgg.map((item) => ({
        category: item._id,
        quantityKg: Math.round(item.quantityKg * 10) / 10,
      }));

      // 4. Processing method breakdown
      const methodAgg = await ProcessingRecord.aggregate([
        {
          $group: {
            _id: '$processingMethod',
            quantityKg: { $sum: '$processedQuantityKg' },
          },
        },
      ]);

      const processingBreakdown = methodAgg.map((item) => ({
        method: item._id,
        quantityKg: Math.round(item.quantityKg * 10) / 10,
      }));

      return res.json({
        totalCollectedKg,
        totalProcessedKg: Math.round(totals.totalProcessedKg * 10) / 10,
        totalRecycledKg: Math.round(totals.totalRecycledKg * 10) / 10,
        totalCompostedKg: Math.round(totals.totalCompostedKg * 10) / 10,
        totalRecoveredKg: Math.round(totals.totalRecoveredKg * 10) / 10,
        totalLandfillDivertedKg: Math.round(totals.totalLandfillDivertedKg * 10) / 10,
        recordsCount: totals.recordsCount,
        categoryBreakdown,
        processingBreakdown,
      });
    } else {
      const stats = await inMemoryStore.getImpactStats();
      return res.json(stats);
    }
  } catch (error) {
    console.error('Get impact stats error:', error);
    return res.status(500).json({ error: 'Failed to calculate environmental impact statistics' });
  }
};
