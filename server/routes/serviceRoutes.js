const express = require('express');
const { body, validationResult } = require('express-validator');//add validation-express
const router = express.Router();
const Service = require('../models/service.js');
const { createService,deleteService } = require('../controllers/serviceController.js');

//service input validation
const validateService = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('provider').isMongoId().withMessage('Provider ID must be a valid ObjectId')
];

// service with validation - Use only the controller function- / POST /api/services/create service
router.post('/create', validateService, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, createService);

// GET all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// DELETE a specific service -service provider
router.delete('/:serviceId', deleteService);

module.exports = router;