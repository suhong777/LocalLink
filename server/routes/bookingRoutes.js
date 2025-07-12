const express = require('express');
const router = express.Router();
const { createBooking,getBookingsByCustomer} = require('../controllers/bookingController.js');

router.post('/create', createBooking); // POST /api/bookings/create

// GET /api/bookings/customer/:customerId   -return all bookings made by a specific customer
router.get('/customer/:customerId', getBookingsByCustomer);   

module.exports = router;