import express from 'express';
import { getImpactStats } from '../controllers/impactController.js';

const router = express.Router();

router.get('/stats', getImpactStats);

export default router;
