const express = require('express');
const router = express.Router();
const { registerUser,loginUser } = require('../controllers/userController.js'); // Get the controller
const User = require('../models/user.js');

//set up the /register endpoint
router.post('/register', registerUser);

//set up the /login endpoint- also test my terminal too see why login failed
router.post('/login', (req, res, next) => {
  console.log("🔥 /login endpoint HIT");
  next(); // go to loginUser after this
}, loginUser);

module.exports = router;