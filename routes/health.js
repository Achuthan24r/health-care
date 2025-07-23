const express = require('express');
const HealthRecord = require('../models/HealthRecord');
const auth = require('../middleware/auth');
const router = express.Router();

// Add health record
router.post('/records', auth, async (req, res) => {
  try {
    const { type, value, unit, notes, recordedAt } = req.body;

    const healthRecord = new HealthRecord({
      userId: req.userId,
      type,
      value,
      unit,
      notes,
      recordedAt: recordedAt || new Date()
    });

    await healthRecord.save();
    res.status(201).json({ message: 'Health record added', record: healthRecord });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get health records
router.get('/records', auth, async (req, res) => {
  try {
    const { type, startDate, endDate, limit = 50 } = req.query;
    
    let query = { userId: req.userId };
    
    if (type) query.type = type;
    if (startDate || endDate) {
      query.recordedAt = {};
      if (startDate) query.recordedAt.$gte = new Date(startDate);
      if (endDate) query.recordedAt.$lte = new Date(endDate);
    }

    const records = await HealthRecord.find(query)
      .sort({ recordedAt: -1 })
      .limit(parseInt(limit));

    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get health stats
router.get('/stats', auth, async (req, res) => {
  try {
    const { type, period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = { 
      userId: req.userId,
      recordedAt: { $gte: startDate }
    };
    
    if (type) query.type = type;

    const records = await HealthRecord.find(query).sort({ recordedAt: 1 });
    
    const stats = {
      totalRecords: records.length,
      types: {},
      trends: []
    };

    records.forEach(record => {
      if (!stats.types[record.type]) {
        stats.types[record.type] = { count: 0, latest: null };
      }
      stats.types[record.type].count++;
      stats.types[record.type].latest = record;
    });

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;