import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { inMemoryStore } from '../utils/inMemoryStore.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ecohub_super_secret_hackathon_key_2026', {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, location, hubId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const lowerEmail = email.toLowerCase();
    const isMongoConnected = mongoose.connection.readyState === 1;

    let userExists = false;
    if (isMongoConnected) {
      userExists = await User.findOne({ email: lowerEmail });
    } else {
      userExists = await inMemoryStore.findUserByEmail(lowerEmail);
    }

    if (userExists) {
      return res.status(400).json({ error: 'An account with this email address already exists' });
    }

    let user;
    if (isMongoConnected) {
      user = await User.create({
        name,
        email: lowerEmail,
        password,
        role: role || 'generator',
        phone: phone || '',
        address: address || '',
        location: location || { latitude: 0, longitude: 0 },
        hubId: hubId || null,
      });
    } else {
      user = await inMemoryStore.createUser({
        name,
        email: lowerEmail,
        password,
        role: role || 'generator',
        phone: phone || '',
        address: address || '',
        location: location || { latitude: 0, longitude: 0 },
        hubId: hubId || null,
      });
    }

    const token = generateToken(user._id || user.id);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        location: user.location,
        hubId: user.hubId,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Server error during user registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password' });
    }

    const lowerEmail = email.toLowerCase();
    const isMongoConnected = mongoose.connection.readyState === 1;

    let user = null;
    let isMatch = false;

    if (isMongoConnected) {
      user = await User.findOne({ email: lowerEmail }).select('+password');
      if (user) {
        isMatch = await user.matchPassword(password);
      }
    } else {
      user = await inMemoryStore.findUserByEmail(lowerEmail);
      if (user) {
        isMatch = await inMemoryStore.matchPassword(user, password);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id || user.id);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        location: user.location,
        hubId: user.hubId,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during user login' });
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.json({
      user: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        address: req.user.address,
        location: req.user.location,
        hubId: req.user.hubId,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ error: 'Server error fetching user profile' });
  }
};
