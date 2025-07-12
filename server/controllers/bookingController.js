const Booking = require('../models/booking.js');
const User = require('../models/user.js');

//create booking request- customer
const createBooking = async (req, res) => {
  const { serviceId, customerId, notes } = req.body;

  try {
    const customer = await User.findById(customerId);

    if (!customer || customer.role !== 'customer') {
      return res.status(403).json({ message: 'Only registered customers can book services' });
    }

    const newBooking = await Booking.create({
      service: serviceId,
      customer: customerId,
      notes
    });

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
};

//get booking
const getBookingsByCustomer = async (req, res) => {
  const { customerId } = req.params;

  try {
    const bookings = await Booking.find({ customer: customerId })
      .populate('service'); // Include service details
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

module.exports = {
  createBooking,
  getBookingsByCustomer
};