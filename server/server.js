require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require('./routes/userRoutes.js');
const serviceRoutes = require('./routes/serviceRoutes.js');

app.use('/api/users', userRoutes);   //Any request that starts with /api/users ,go look in userRoutes to find out how to handle it
app.use('/api/services', serviceRoutes);

// Connect to MongoDB
console.log("MONGO_URI:", process.env.MONGO_URI);//test the mongodb
mongoose.connect(process.env.MONGO_URI,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));