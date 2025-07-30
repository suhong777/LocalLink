require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "../client")));

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Import routes
const userRoutes = require('./routes/userRoutes.js');//user route
const serviceRoutes = require('./routes/serviceRoutes.js');//service route
const bookingRoutes = require('./routes/bookingRoutes.js'); //booking route
const contactRoutes = require('./routes/contactRoutes.js');//contact route

app.use('/api/users', userRoutes);   //Any request that starts with /api/users ,go look in userRoutes to find out how to handle it
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use("/api/contact", contactRoutes);

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