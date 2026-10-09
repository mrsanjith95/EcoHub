import express from 'express';
import {
  createWasteReport,
  getWasteReports,
  getWasteReportById,
  updateWasteReportStatus,
} from '../controllers/wasteController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/reports', protect, upload.single('image'), handleUploadError, createWasteReport);
router.get('/reports', protect, getWasteReports);
router.get('/reports/:id', protect, getWasteReportById);
router.patch('/reports/:id/status', protect, updateWasteReportStatus);

export default router;
