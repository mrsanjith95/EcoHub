import express from 'express';
import { getCollectorJobs } from '../controllers/collectorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/jobs', protect, authorize('collector', 'admin'), getCollectorJobs);

export default router;
