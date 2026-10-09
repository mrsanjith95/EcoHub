import express from 'express';
import { getAdminOverview } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/overview', protect, authorize('admin'), getAdminOverview);

export default router;
