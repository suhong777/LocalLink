const express = require('express');
//add registration route
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { registerUser,loginUser } = require('../controllers/userController.js'); // Get the controller

// Validate registration input
const validateRegistration = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['customer', 'provider']).withMessage('Role must be customer or provider')
];

// Route: POST /api/users/register with validation
router.post('/register', validateRegistration, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next(); // go to controller
}, registerUser);

// Validation for login
const validateLogin = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/login', validateLogin, (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
    // Route: POST /api/users/login with test log - to understand why log in fail
  console.log("/login endpoint HIT");
  next(); // pass to controller
}, loginUser);

module.exports = router;