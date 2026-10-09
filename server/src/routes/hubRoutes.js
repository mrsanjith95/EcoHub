import express from 'express';
import {
  getHubs,
  getNearbyHubs,
  getHubById,
  getIncomingWaste,
  processWaste,
} from '../controllers/hubController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getHubs);
router.get('/nearby', getNearbyHubs);
router.get('/:id', getHubById);
router.get('/:id/incoming', protect, getIncomingWaste);
router.post('/:id/process', protect, authorize('hub_operator', 'admin'), processWaste);

export default router;
