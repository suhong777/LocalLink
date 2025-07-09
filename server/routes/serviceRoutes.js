const express = require('express');
const router = express.Router();
const Service = require('../models/service.js');

router.post('/create', async (req, res) => {
  const newService = new Service(req.body);
  await newService.save();
  res.json({ message: 'Service created' });
});

router.get('/', async (req, res) => {
  const services = await Service.find();
  res.json(services);
});

module.exports = router;