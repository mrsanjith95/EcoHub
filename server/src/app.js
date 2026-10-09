import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { s3Client, bucketName } from './config/s3.js';
import authRoutes from './routes/authRoutes.js';
import wasteRoutes from './routes/wasteRoutes.js';
import hubRoutes from './routes/hubRoutes.js';
import impactRoutes from './routes/impactRoutes.js';
import collectorRoutes from './routes/collectorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/hubs', hubRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/collector', collectorRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'EcoHub Waste Management API is running',
    timestamp: new Date().toISOString(),
    services: {
      database: 'MongoDB',
      aws_s3: s3Client ? 'Configured' : 'Fallback Mode (No Credentials Provided)',
      bucket: bucketName,
    },
  });
});

app.listen(PORT, () => {
  console.log(`[EcoHub Server] Express server listening on http://localhost:${PORT}`);
});
