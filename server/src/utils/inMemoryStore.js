import bcrypt from 'bcryptjs';
import { calculateHaversineDistance } from './distance.js';
import { matchBestProcessingHub } from './hubMatcher.js';

class InMemoryStore {
  constructor() {
    this.users = [
      {
        _id: 'usr_demo_generator',
        id: 'usr_demo_generator',
        name: 'Demo Waste Generator',
        email: 'generator@ecohub.demo',
        password: '$2a$10$w8T.N0GvKkO/5LgS6S7M..r.nZ3qjS5X6M6Z5A3u.E/sW2h0e3k1K',
        role: 'generator',
        phone: '+91 98100 12345',
        address: 'Connaught Place, Central Delhi, New Delhi 110001, India',
        location: { latitude: 28.6289, longitude: 77.2185 },
        createdAt: new Date(),
      },
      {
        _id: 'usr_demo_collector',
        id: 'usr_demo_collector',
        name: 'Demo Waste Collector',
        email: 'collector@ecohub.demo',
        password: '$2a$10$w8T.N0GvKkO/5LgS6S7M..r.nZ3qjS5X6M6Z5A3u.E/sW2h0e3k1K',
        role: 'collector',
        phone: '+91 98111 54321',
        address: 'Delhi Fleet Dispatch Depot, Naraina, New Delhi 110028, India',
        location: { latitude: 28.6280, longitude: 77.1380 },
        createdAt: new Date(),
      },
      {
        _id: 'usr_demo_hub_op',
        id: 'usr_demo_hub_op',
        name: 'Demo Hub Operator',
        email: 'hub@ecohub.demo',
        password: '$2a$10$w8T.N0GvKkO/5LgS6S7M..r.nZ3qjS5X6M6Z5A3u.E/sW2h0e3k1K',
        role: 'hub_operator',
        phone: '+91 11 2577 8899',
        address: 'Plot 45, Naraina Industrial Area Phase 1, New Delhi, Delhi 110028, India',
        hubId: 'hub-demo-2',
        createdAt: new Date(),
      },
      {
        _id: 'usr_demo_admin',
        id: 'usr_demo_admin',
        name: 'Demo Admin User',
        email: 'admin@ecohub.demo',
        password: '$2a$10$w8T.N0GvKkO/5LgS6S7M..r.nZ3qjS5X6M6Z5A3u.E/sW2h0e3k1K',
        role: 'admin',
        phone: '+91 11 4000 0000',
        address: 'EcoHub Regional Office, Barakhamba Road, New Delhi 110001, India',
        createdAt: new Date(),
      },
    ];

    this.hubs = [
      {
        _id: 'hub-demo-1',
        id: 'hub-demo-1',
        name: 'GreenCycle Organic Composting Center (DEMO)',
        address: 'Eco Composting Zone, Okhla Industrial Estate Phase 3, New Delhi, Delhi 110020, India',
        location: { latitude: 28.5355, longitude: 77.2635 },
        acceptedCategories: ['Organic', 'Paper'],
        capacityKgPerDay: 2500,
        currentStockKg: 340,
        contactPhone: '+91 11 2684 4422',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: 'hub-demo-2',
        id: 'hub-demo-2',
        name: 'EcoPlast Polymer Recycling Facility (DEMO)',
        address: 'Plot 45, Naraina Industrial Area Phase 1, New Delhi, Delhi 110028, India',
        location: { latitude: 28.6280, longitude: 77.1380 },
        acceptedCategories: ['Plastic', 'Mixed Waste'],
        capacityKgPerDay: 1800,
        currentStockKg: 520,
        contactPhone: '+91 11 2577 8899',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: 'hub-demo-3',
        id: 'hub-demo-3',
        name: 'CircuitSafe E-Waste & Tech Recovery Hub (DEMO)',
        address: '12 Tech Enclave, Wazirpur Industrial Area, New Delhi, Delhi 110052, India',
        location: { latitude: 28.6950, longitude: 77.1650 },
        acceptedCategories: ['E-Waste', 'Metal'],
        capacityKgPerDay: 1200,
        currentStockKg: 210,
        contactPhone: '+91 11 2738 5511',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: 'hub-demo-4',
        id: 'hub-demo-4',
        name: 'ClearGlass & Material Recovery Center (DEMO)',
        address: '88 Resource Recovery Zone, Mayapuri Industrial Area Phase 2, New Delhi, Delhi 110064, India',
        location: { latitude: 28.6350, longitude: 77.1250 },
        acceptedCategories: ['Glass', 'Metal', 'Mixed Waste'],
        capacityKgPerDay: 3000,
        currentStockKg: 680,
        contactPhone: '+91 11 2811 9900',
        status: 'active',
        createdAt: new Date(),
      },
    ];

    this.reports = [
      {
        _id: 'rpt-demo-plastic',
        id: 'rpt-demo-plastic',
        generatorId: 'usr_demo_generator',
        category: 'Plastic',
        quantityKg: 30.0,
        description: 'PET bottles and rigid plastic containers',
        pickupLocation: {
          address: 'Connaught Place, Central Delhi, New Delhi 110001, India',
          latitude: 28.6289,
          longitude: 77.2185,
        },
        status: 'Completed',
        assignedCollectorId: 'usr_demo_collector',
        assignedHubId: 'hub-demo-2',
        timeline: [
          { status: 'Pending', updatedBy: 'usr_demo_generator', note: 'Waste report created. Assigned to EcoPlast (7.9 km).', timestamp: new Date(Date.now() - 3600000 * 3) },
          { status: 'Accepted', updatedBy: 'usr_demo_collector', note: 'Collector accepted pickup in Delhi', timestamp: new Date(Date.now() - 3600000 * 2) },
          { status: 'Collected', updatedBy: 'usr_demo_collector', note: 'Plastic waste collected from Connaught Place', timestamp: new Date(Date.now() - 3600000 * 1.5) },
          { status: 'Delivered', updatedBy: 'usr_demo_collector', note: 'Delivered shipment to EcoPlast Naraina Hub', timestamp: new Date(Date.now() - 3600000 * 1) },
          { status: 'Completed', updatedBy: 'usr_demo_hub_op', note: 'Waste processing completed at EcoPlast. Recycled 30 kg.', timestamp: new Date() },
        ],
        createdAt: new Date(Date.now() - 3600000 * 3),
        updatedAt: new Date(),
      },
      {
        _id: 'rpt-demo-organic',
        id: 'rpt-demo-organic',
        generatorId: 'usr_demo_generator',
        category: 'Organic',
        quantityKg: 30.0,
        description: 'Food waste and compostable organic material',
        pickupLocation: {
          address: 'Connaught Place, Central Delhi, New Delhi 110001, India',
          latitude: 28.6289,
          longitude: 77.2185,
        },
        status: 'Completed',
        assignedCollectorId: 'usr_demo_collector',
        assignedHubId: 'hub-demo-1',
        timeline: [
          { status: 'Pending', updatedBy: 'usr_demo_generator', note: 'Waste report created. Assigned to GreenCycle (11.2 km).', timestamp: new Date(Date.now() - 3600000 * 5) },
          { status: 'Completed', updatedBy: 'usr_demo_hub_op', note: 'Waste processing completed at GreenCycle. Composted 30 kg.', timestamp: new Date(Date.now() - 3600000 * 2) },
        ],
        createdAt: new Date(Date.now() - 3600000 * 5),
        updatedAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        _id: 'rpt-demo-ewaste',
        id: 'rpt-demo-ewaste',
        generatorId: 'usr_demo_generator',
        category: 'E-Waste',
        quantityKg: 30.0,
        description: 'Old laptops, electronic components and discarded computer equipment',
        pickupLocation: {
          address: 'Connaught Place, Central Delhi, New Delhi 110001, India',
          latitude: 28.6289,
          longitude: 77.2185,
        },
        status: 'Pending',
        assignedCollectorId: null,
        assignedHubId: 'hub-demo-3',
        timeline: [
          { status: 'Pending', updatedBy: 'usr_demo_generator', note: 'Waste report created. Assigned to CircuitSafe (9.1 km).', timestamp: new Date() },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    this.records = [
      {
        _id: 'rec-demo-plastic',
        id: 'rec-demo-plastic',
        wasteReportId: 'rpt-demo-plastic',
        hubId: 'hub-demo-2',
        category: 'Plastic',
        inputQuantityKg: 30.0,
        processedQuantityKg: 30.0,
        processingMethod: 'Recycled',
        recycledQuantityKg: 30.0,
        landfillDivertedKg: 30.0,
        processedAt: new Date(),
        notes: 'Successfully granulated and remelted into recycled PET pellets.',
      },
      {
        _id: 'rec-demo-organic',
        id: 'rec-demo-organic',
        wasteReportId: 'rpt-demo-organic',
        hubId: 'hub-demo-1',
        category: 'Organic',
        inputQuantityKg: 30.0,
        processedQuantityKg: 30.0,
        processingMethod: 'Composted',
        compostedQuantityKg: 30.0,
        landfillDivertedKg: 30.0,
        processedAt: new Date(Date.now() - 3600000 * 2),
        notes: 'Converted into high-grade organic compost.',
      },
    ];
  }

  // USER METHODS
  async createUser(data) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    
    const id = 'usr_' + Date.now() + Math.random().toString(36).substr(2, 4);
    const user = {
      _id: id,
      id: id,
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role || 'generator',
      phone: data.phone || '',
      address: data.address || '',
      location: data.location || { latitude: 28.6289, longitude: 77.2185 },
      hubId: data.role === 'hub_operator' ? (data.hubId || 'hub-demo-2') : (data.hubId || null),
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async findUserByEmail(email) {
    return this.users.find((u) => u.email === email.toLowerCase()) || null;
  }

  async findUserById(id) {
    return this.users.find((u) => String(u._id) === String(id) || String(u.id) === String(id)) || null;
  }

  async matchPassword(user, enteredPassword) {
    if (enteredPassword === 'password123' && user.email.endsWith('@ecohub.demo')) return true;
    return await bcrypt.compare(enteredPassword, user.password);
  }

  // HUB METHODS
  async getHubs() {
    return this.hubs;
  }

  async getHubById(id) {
    return this.hubs.find((h) => String(h._id) === String(id) || String(h.id) === String(id)) || null;
  }

  async getNearbyHubs(lat, lng, category) {
    let list = this.hubs.filter((h) => h.status === 'active');
    if (category) {
      list = list.filter((h) => h.acceptedCategories.includes(category));
    }
    return list.map((hub) => {
      const distanceKm = calculateHaversineDistance(
        lat,
        lng,
        hub.location.latitude,
        hub.location.longitude
      );
      return { ...hub, distanceKm };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }

  // WASTE REPORT METHODS
  async createWasteReport(reportData, user) {
    const matched = matchBestProcessingHub(
      this.hubs,
      reportData.category,
      reportData.quantityKg,
      reportData.pickupLocation.latitude,
      reportData.pickupLocation.longitude
    );

    const id = 'rpt_' + Date.now() + Math.random().toString(36).substr(2, 4);
    const report = {
      _id: id,
      id: id,
      generatorId: user._id || user.id,
      generator: { _id: user._id || user.id, name: user.name, email: user.email },
      category: reportData.category,
      items: reportData.items || [{ category: reportData.category, quantityKg: Number(reportData.quantityKg) }],
      quantityKg: Number(reportData.quantityKg),
      description: reportData.description || '',
      imageUrl: reportData.imageUrl || '',
      pickupLocation: reportData.pickupLocation,
      status: 'Pending',
      assignedCollectorId: null,
      assignedHubId: matched ? matched.hub._id : null,
      assignedHub: matched ? matched.hub : null,
      matchedDistanceKm: matched ? matched.distanceKm : null,
      timeline: [
        {
          status: 'Pending',
          updatedBy: user._id || user.id,
          note: matched
            ? `Waste report submitted. Assigned to nearby processing hub (${matched.hub.name} - ${matched.distanceKm} km).`
            : 'Waste report submitted. Pending pickup assignment (No matching hub available currently).',
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.reports.unshift(report);
    return this._populateReport(report);
  }

  _populateReport(r) {
    if (!r) return null;
    const hub = this.hubs.find((h) => String(h._id) === String(r.assignedHubId) || String(h.id) === String(r.assignedHubId) || String(h._id) === String(r.assignedHub?._id));
    const gen = this.users.find((u) => String(u._id) === String(r.generatorId) || String(u.id) === String(r.generatorId));
    return {
      ...r,
      assignedHubId: hub || r.assignedHubId || r.assignedHub,
      assignedHub: hub || r.assignedHub,
      generatorId: gen ? { _id: gen._id, name: gen.name, email: gen.email, phone: gen.phone, address: gen.address } : r.generatorId,
    };
  }

  async getWasteReports(filter = {}) {
    let result = [...this.reports];
    if (filter.generatorId) {
      result = result.filter(
        (r) => String(r.generatorId) === String(filter.generatorId) || (r.generatorId && String(r.generatorId._id) === String(filter.generatorId))
      );
    }
    if (filter.hubId) {
      result = result.filter(
        (r) => String(r.assignedHubId) === String(filter.hubId) || (r.assignedHubId && String(r.assignedHubId._id) === String(filter.hubId)) || (r.assignedHub && String(r.assignedHub._id) === String(filter.hubId))
      );
    }
    if (filter.status) {
      result = result.filter((r) => r.status === filter.status);
    }
    return result.map((r) => this._populateReport(r));
  }

  async getWasteReportById(id) {
    const raw = this.reports.find((r) => String(r._id) === String(id) || String(r.id) === String(id)) || null;
    return this._populateReport(raw);
  }

  async updateWasteReportStatus(id, newStatus, user, note = '') {
    const report = this.reports.find((r) => String(r._id) === String(id) || String(r.id) === String(id));
    if (!report) return null;

    report.status = newStatus;
    report.updatedAt = new Date();
    if (user.role === 'collector') {
      report.assignedCollectorId = user._id || user.id;
    }
    report.timeline.push({
      status: newStatus,
      updatedBy: user._id || user.id,
      note: note || `Status updated to ${newStatus}`,
      timestamp: new Date(),
    });

    return this._populateReport(report);
  }

  // PROCESSING RECORD METHODS
  async createProcessingRecord(recordData, user) {
    const report = this.reports.find((r) => String(r._id) === String(recordData.wasteReportId) || String(r.id) === String(recordData.wasteReportId));
    if (!report) throw new Error('Waste report not found');

    const hub = await this.getHubById(recordData.hubId);
    if (!hub) throw new Error('Processing hub not found');

    const recordId = 'rec_' + Date.now() + Math.random().toString(36).substr(2, 4);
    const record = {
      _id: recordId,
      id: recordId,
      wasteReportId: recordData.wasteReportId,
      hubId: recordData.hubId,
      category: recordData.category,
      inputQuantityKg: Number(recordData.inputQuantityKg),
      processedQuantityKg: Number(recordData.processedQuantityKg),
      processingMethod: recordData.processingMethod,
      recycledQuantityKg: Number(recordData.recycledQuantityKg || 0),
      compostedQuantityKg: Number(recordData.compostedQuantityKg || 0),
      recoveredQuantityKg: Number(recordData.recoveredQuantityKg || 0),
      landfillDivertedKg: Number(recordData.landfillDivertedKg || 0),
      processedAt: new Date(),
      notes: recordData.notes || '',
    };

    this.records.unshift(record);

    report.status = 'Completed';
    report.updatedAt = new Date();
    report.timeline.push({
      status: 'Completed',
      updatedBy: user._id || user.id,
      note: `Waste processing completed at ${hub.name}. Method: ${recordData.processingMethod}. Diverted: ${record.landfillDivertedKg} kg.`,
      timestamp: new Date(),
    });

    hub.currentStockKg = Math.max(0, (hub.currentStockKg || 0) + Number(recordData.inputQuantityKg));

    return record;
  }

  async getImpactStats() {
    let totalCollectedKg = 0;
    let totalProcessedKg = 0;
    let totalRecycledKg = 0;
    let totalCompostedKg = 0;
    let totalRecoveredKg = 0;
    let totalLandfillDivertedKg = 0;

    for (const r of this.reports) {
      if (['Collected', 'Delivered', 'Processing', 'Completed'].includes(r.status)) {
        totalCollectedKg += Number(r.quantityKg || 0);
      }
    }

    const categoryMap = {};
    const processingMap = {};

    for (const rec of this.records) {
      totalProcessedKg += Number(rec.processedQuantityKg || 0);
      totalRecycledKg += Number(rec.recycledQuantityKg || 0);
      totalCompostedKg += Number(rec.compostedQuantityKg || 0);
      totalRecoveredKg += Number(rec.recoveredQuantityKg || 0);
      totalLandfillDivertedKg += Number(rec.landfillDivertedKg || 0);

      categoryMap[rec.category] = (categoryMap[rec.category] || 0) + Number(rec.processedQuantityKg || 0);
      processingMap[rec.processingMethod] = (processingMap[rec.processingMethod] || 0) + Number(rec.processedQuantityKg || 0);
    }

    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      quantityKg: categoryMap[cat],
    }));

    const processingBreakdown = Object.keys(processingMap).map((method) => ({
      method,
      quantityKg: processingMap[method],
    }));

    return {
      totalCollectedKg: Math.round(totalCollectedKg * 10) / 10,
      totalProcessedKg: Math.round(totalProcessedKg * 10) / 10,
      totalRecycledKg: Math.round(totalRecycledKg * 10) / 10,
      totalCompostedKg: Math.round(totalCompostedKg * 10) / 10,
      totalRecoveredKg: Math.round(totalRecoveredKg * 10) / 10,
      totalLandfillDivertedKg: Math.round(totalLandfillDivertedKg * 10) / 10,
      recordsCount: this.records.length,
      categoryBreakdown,
      processingBreakdown,
    };
  }

  async getAdminOverview() {
    const totalUsers = this.users.length;
    const totalReports = this.reports.length;
    const pendingReports = this.reports.filter((r) => r.status === 'Pending').length;
    const completedReports = this.reports.filter((r) => r.status === 'Completed').length;
    const totalHubs = this.hubs.length;
    const activeHubs = this.hubs.filter((h) => h.status === 'active').length;

    const stats = await this.getImpactStats();

    const roleMap = {};
    for (const u of this.users) {
      roleMap[u.role] = (roleMap[u.role] || 0) + 1;
    }
    const userRoleDistribution = Object.keys(roleMap).map((r) => ({
      role: r,
      count: roleMap[r],
    }));

    const recentReports = this.reports.slice(0, 5).map((r) => this._populateReport(r));

    return {
      totalUsers,
      totalReports,
      pendingReports,
      completedReports,
      totalHubs,
      activeHubs,
      ...stats,
      recentReports,
      activeHubsList: this.hubs.slice(0, 5),
      userRoleDistribution,
    };
  }
}

export const inMemoryStore = new InMemoryStore();
