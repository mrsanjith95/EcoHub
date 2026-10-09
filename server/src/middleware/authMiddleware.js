import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { inMemoryStore } from '../utils/inMemoryStore.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecohub_super_secret_hackathon_key_2026');

      if (mongoose.connection.readyState === 1) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        req.user = await inMemoryStore.findUserById(decoded.id);
      }

      if (!req.user) {
        return res.status(401).json({ error: 'User no longer exists' });
      }

      return next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ error: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no Bearer token provided' });
  }
};
