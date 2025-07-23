const express = require('express');
const { body, validationResult } = require('express-validator');//booking validation
const router = express.Router();
const { createBooking,getBookingsByCustomer, getBookingsByProvider,  updateBookingStatus , deleteBooking } = require('../controllers/bookingController.js');

//booking validation
const validateBooking = [
  body('service').isMongoId().withMessage('Service ID must be a valid ObjectId'),
  body('customer').isMongoId().withMessage('Customer ID must be a valid ObjectId'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

// POST /api/bookings/create
router.post('/create', validateBooking, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next(); // proceed to controller
}, createBooking);

// GET /api/bookings/customer/:customerId   -return all bookings made by a specific customer
router.get('/customer/:customerId', getBookingsByCustomer);  
//return all bookings made via service id
router.get('/provider/:providerId', getBookingsByProvider);
//booking status update
router.put('/:bookingId/status', updateBookingStatus);
//  DELETE /api/bookings/:bookingId -delete booking (for customers)
router.delete('/:bookingId', deleteBooking); 

module.exports = router;