const express = require('express');
const Medication = require('../models/Medication');
const auth = require('../middleware/auth');
const router = express.Router();

// Add medication
router.post('/', auth, async (req, res) => {
  try {
    const { name, dosage, frequency, reminderTimes, startDate, endDate, instructions } = req.body;

    const medication = new Medication({
      userId: req.userId,
      name,
      dosage,
      frequency,
      reminderTimes,
      startDate,
      endDate,
      instructions
    });

    await medication.save();
    res.status(201).json({ message: 'Medication added', medication });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get medications
router.get('/', auth, async (req, res) => {
  try {
    const { active = 'true' } = req.query;
    
    let query = { userId: req.userId };
    if (active === 'true') {
      query.isActive = true;
      query.$or = [
        { endDate: { $exists: false } },
        { endDate: { $gte: new Date() } }
      ];
    }

    const medications = await Medication.find(query).sort({ createdAt: -1 });
    res.json({ medications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update medication
router.put('/:id', auth, async (req, res) => {
  try {
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.json({ message: 'Medication updated', medication });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete medication
router.delete('/:id', auth, async (req, res) => {
  try {
    const medication = await Medication.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.json({ message: 'Medication deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;