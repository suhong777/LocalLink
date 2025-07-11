const express = require('express');
const router = express.Router();
const Service = require('../models/service.js');
const { createService } = require('../controllers/serviceController.js');

// Use only the controller function
router.post('/create', createService);// POST /api/services/create

// GET all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

module.exports = router;