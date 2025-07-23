const Booking = require('../models/booking.js');
const User = require('../models/user.js');
const Service = require('../models/service.js');


//create booking request- customer
const createBooking = async (req, res) => {
  const { service, customer, notes } = req.body;

  try {
    const customerUser = await User.findById(customer);

    if (!customerUser|| customerUser.role !== 'customer') {
      return res.status(403).json({ message: 'Only registered customers can book services' });
    }

    //  Verify the service exists
    const serviceExists = await Service.findById(service);
    if (!serviceExists) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Create the booking
    const newBooking = await Booking.create({
      service: service,
      customer: customer,
      notes
    });


   //  Return success response with booking details
    res.status(201).json({ 
      message: 'Booking created successfully!',
      booking: newBooking 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      message: 'Error creating booking', 
      error: error.message 
    });
  }
};

//get booking - use customer id to find the booking details
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

//get booking - use service id to check the booking details
const getBookingsByProvider = async (req, res) => {
  const { providerId } = req.params;

  try {
    // Step 1: Find all services created by the provider
    const providerServices = await Service.find({ provider: providerId });

    // Step 2: Extract service IDs
    const serviceIds = providerServices.map(service => service._id);

    // Step 3: Find bookings that match those service IDs
    const bookings = await Booking.find({ service: { $in: serviceIds } })
      .populate('service')
      .populate('customer');

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching provider bookings', error: error.message });
  }
};

//update booking status
const updateBookingStatus = async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  const allowedStatus = ['pending', 'accepted', 'rejected'];
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    ).populate('service customer');

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking status updated', booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
};

//delete booking option for customer
const deleteBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Find the booking first to verify it exists
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Delete the booking
    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ 
      message: 'Error deleting booking', 
      error: error.message 
    });
  }
};


module.exports = {
  createBooking,
  getBookingsByCustomer,
  getBookingsByProvider,
  updateBookingStatus,
  deleteBooking 
};