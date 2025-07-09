const User = require('../models/user.js'); // Import the User model

// Function to register a user - handle registration request -get request from frontend and save to DB
const registerUser = async (req, res) => {
  try {
    const newUser = new User(req.body); // Take data from form (frontend)
    await newUser.save();               // Save to MongoDB
    res.status(201).json({ message: 'You have succesfully registered the account.' }); // Send success response
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user, please provide valid information' }); // Send error response
  }
};

module.exports = { registerUser }; // Export the function