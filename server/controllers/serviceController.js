const Service = require('../models/service.js');// Import the service model
const User = require('../models/user.js'); // Import the User model

const createService = async (req, res) => {
  const { title, description, price, provider} = req.body;

  try {
    //find the user via provider id
     const user = await User.findById(provider);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can create services' });
    }

     // Create service linked to provider
    const service = await Service.create({
      title,
      description,
      price,
      provider
    });

    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: 'Error creating service', error: err.message });
  }
};

//delete the service
const deleteService = async (req, res) => {
  const { serviceId } = req.params;
  
  try {
    // Find the service first
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await Service.findByIdAndDelete(serviceId);
    
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting service', error: err.message });
  }
};

module.exports = {
  createService,
  deleteService
};

