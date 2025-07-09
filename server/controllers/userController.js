const bcrypt = require('bcrypt'); //encrypt the password
const User = require('../models/user.js');

//register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    //save the new user password -encrypt happen in schema
    const newUser = new User({ name, email, password, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    //console.error("Registration error:", error);//show me the actual error
    res.status(500).json({ error: 'Registration failed' });
  }
};

// authenticate a user - for existing user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
     console.log("User found:", user); // debug to find the user

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    //debug the password
    console.log("Entered password:", password);
    console.log("Stored hashed password:", user.password);

    // Compare the password
     const isMatch = await user.matchPassword(password);
     console.log("Password match:", isMatch); // debug the password
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  
    //success log in
  res.status(200).json({
  message: 'Login successful',
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});
 } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
  
module.exports = {
  registerUser,
  loginUser
};
