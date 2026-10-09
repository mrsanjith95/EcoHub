import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProcessingHub from '../models/ProcessingHub.js';
import User from '../models/User.js';
import WasteReport from '../models/WasteReport.js';
import ProcessingRecord from '../models/ProcessingRecord.js';

dotenv.config();

// Realistic DEMO processing hubs for Hackathon Demonstration (Delhi, India)
const DEMO_HUBS = [
  {
    name: 'EcoPlast Polymer Recycling Facility (DEMO)',
    address: 'Plot 45, Naraina Industrial Area Phase 1, New Delhi, Delhi 110028, India',
    location: { latitude: 28.6280, longitude: 77.1380 },
    acceptedCategories: ['Plastic', 'Mixed Waste'],
    capacityKgPerDay: 1800,
    currentStockKg: 520,
    contactPhone: '+91 11 2577 8899',
    status: 'active',
  },
  {
    name: 'GreenCycle Organic Composting Center (DEMO)',
    address: 'Eco Composting Zone, Okhla Industrial Estate Phase 3, New Delhi, Delhi 110020, India',
    location: { latitude: 28.5355, longitude: 77.2635 },
    acceptedCategories: ['Organic', 'Paper'],
    capacityKgPerDay: 2500,
    currentStockKg: 340,
    contactPhone: '+91 11 2684 4422',
    status: 'active',
  },
  {
    name: 'CircuitSafe E-Waste & Tech Recovery Hub (DEMO)',
    address: '12 Tech Enclave, Wazirpur Industrial Area, New Delhi, Delhi 110052, India',
    location: { latitude: 28.6950, longitude: 77.1650 },
    acceptedCategories: ['E-Waste', 'Metal'],
    capacityKgPerDay: 1200,
    currentStockKg: 210,
    contactPhone: '+91 11 2738 5511',
    status: 'active',
  },
  {
    name: 'ClearGlass & Material Recovery Center (DEMO)',
    address: '88 Resource Recovery Zone, Mayapuri Industrial Area Phase 2, New Delhi, Delhi 110064, India',
    location: { latitude: 28.6350, longitude: 77.1250 },
    acceptedCategories: ['Glass', 'Metal', 'Mixed Waste'],
    capacityKgPerDay: 3000,
    currentStockKg: 680,
    contactPhone: '+91 11 2811 9900',
    status: 'active',
  },
];

export const seedProcessingHubs = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecohub';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
    }

    console.log('[Seed Script] Seeding DEMO Processing Hubs & Multi-Role Demo Users (Delhi, India)...');

    let hubsMap = {};

    for (const hubData of DEMO_HUBS) {
      let hub = await ProcessingHub.findOne({ name: hubData.name });
      if (hub) {
        await ProcessingHub.updateOne({ _id: hub._id }, { $set: hubData });
      } else {
        hub = await ProcessingHub.create(hubData);
      }
      hubsMap[hub.name] = hub;
    }

    // Seed Demo Users for each role
    const demoUsers = [
      {
        name: 'Demo Waste Generator',
        email: 'generator@ecohub.demo',
        password: 'password123',
        role: 'generator',
        phone: '+91 98100 12345',
        address: 'Connaught Place, Central Delhi, New Delhi 110001, India',
        location: { latitude: 28.6289, longitude: 77.2185 },
      },
      {
        name: 'Demo Waste Collector',
        email: 'collector@ecohub.demo',
        password: 'password123',
        role: 'collector',
        phone: '+91 98111 54321',
        address: 'Delhi Fleet Dispatch Depot, Naraina, New Delhi 110028, India',
        location: { latitude: 28.6280, longitude: 77.1380 },
      },
      {
        name: 'Demo Hub Operator',
        email: 'hub@ecohub.demo',
        password: 'password123',
        role: 'hub_operator',
        phone: '+91 11 2577 8899',
        address: 'Plot 45, Naraina Industrial Area Phase 1, New Delhi, Delhi 110028, India',
        hubId: hubsMap['EcoPlast Polymer Recycling Facility (DEMO)']?._id || null,
      },
      {
        name: 'Demo Admin User',
        email: 'admin@ecohub.demo',
        password: 'password123',
        role: 'admin',
        phone: '+91 11 4000 0000',
        address: 'EcoHub Regional Office, Barakhamba Road, New Delhi 110001, India',
      },
    ];

    let userMap = {};
    for (const u of demoUsers) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create(u);
        console.log(`[Seed Script] Created demo user (${u.role}): ${u.email}`);
      } else {
        await User.updateOne({ _id: existing._id }, { $set: u });
      }
      userMap[u.role] = existing;
    }

    // Clean existing test reports & seed 3 clean demo reports
    await WasteReport.deleteMany({});
    await ProcessingRecord.deleteMany({});

    const genUser = userMap['generator'];
    const ecoPlast = hubsMap['EcoPlast Polymer Recycling Facility (DEMO)'];
    const greenCycle = hubsMap['GreenCycle Organic Composting Center (DEMO)'];
    const circuitSafe = hubsMap['CircuitSafe E-Waste & Tech Recovery Hub (DEMO)'];

    // 1. Plastic Completed Report
    const plasticReport = await WasteReport.create({
      generatorId: genUser._id,
      category: 'Plastic',
      quantityKg: 30.0,
      description: 'PET bottles and rigid plastic containers',
      pickupLocation: {
        address: 'Connaught Place, Central Delhi, New Delhi 110001, India',
        latitude: 28.6289,
        longitude: 77.2185,
      },
      assignedHubId: ecoPlast._id,
      assignedCollectorId: userMap['collector']._id,
      status: 'Completed',
      timeline: [
        { status: 'Pending', updatedBy: genUser._id, note: 'Waste report created. Auto-assigned to EcoPlast (7.9 km).', timestamp: new Date(Date.now() - 3600000 * 3) },
        { status: 'Accepted', updatedBy: userMap['collector']._id, note: 'Collector accepted pickup in Delhi', timestamp: new Date(Date.now() - 3600000 * 2) },
        { status: 'Collected', updatedBy: userMap['collector']._id, note: 'Plastic waste collected from Connaught Place', timestamp: new Date(Date.now() - 3600000 * 1.5) },
        { status: 'Delivered', updatedBy: userMap['collector']._id, note: 'Delivered shipment to EcoPlast Naraina Hub', timestamp: new Date(Date.now() - 3600000 * 1) },
        { status: 'Completed', updatedBy: userMap['hub_operator']._id, note: 'Waste processing completed at EcoPlast. Recycled 30 kg.', timestamp: new Date() },
      ],
    });

    await ProcessingRecord.create({
      wasteReportId: plasticReport._id,
      hubId: ecoPlast._id,
      category: 'Plastic',
      inputQuantityKg: 30.0,
      processedQuantityKg: 30.0,
      processingMethod: 'Recycled',
      recycledQuantityKg: 30.0,
      landfillDivertedKg: 30.0,
      notes: 'Successfully granulated and remelted into recycled PET pellets.',
    });

    // 2. Organic Completed Report
    const organicReport = await WasteReport.create({
      generatorId: genUser._id,
      category: 'Organic',
      quantityKg: 30.0,
      description: 'Food waste and compostable organic material',
      pickupLocation: {
        address: 'Connaught Place, Central Delhi, New Delhi 110001, India',
        latitude: 28.6289,
        longitude: 77.2185,
      },
      assignedHubId: greenCycle._id,
      assignedCollectorId: userMap['collector']._id,
      status: 'Completed',
      timeline: [
        { status: 'Pending', updatedBy: genUser._id, note: 'Waste report created. Auto-assigned to GreenCycle (11.2 km).', timestamp: new Date(Date.now() - 3600000 * 5) },
        { status: 'Completed', updatedBy: userMap['hub_operator']._id, note: 'Waste processing completed at GreenCycle. Composted 30 kg.', timestamp: new Date(Date.now() - 3600000 * 2) },
      ],
    });

    await ProcessingRecord.create({
      wasteReportId: organicReport._id,
      hubId: greenCycle._id,
      category: 'Organic',
      inputQuantityKg: 30.0,
      processedQuantityKg: 30.0,
      processingMethod: 'Composted',
      compostedQuantityKg: 30.0,
      landfillDivertedKg: 30.0,
      notes: 'Converted into high-grade organic compost.',
    });

    // 3. E-Waste Pending Report for Live Demonstration
    await WasteReport.create({
      generatorId: genUser._id,
      category: 'E-Waste',
      quantityKg: 30.0,
      description: 'Old laptops, electronic components and discarded computer equipment',
      pickupLocation: {
        address: 'Connaught Place, Central Delhi, New Delhi 110001, India',
        latitude: 28.6289,
        longitude: 77.2185,
      },
      assignedHubId: circuitSafe._id,
      status: 'Pending',
      timeline: [
        { status: 'Pending', updatedBy: genUser._id, note: 'Waste report created. Auto-assigned to CircuitSafe E-Waste Hub (9.1 km).', timestamp: new Date() },
      ],
    });

    console.log(`[Seed Script] Seed completed successfully with clean Delhi demo data.`);
  } catch (error) {
    console.error('[Seed Script Error] Failed to seed demo hubs:', error.message);
  }
};
