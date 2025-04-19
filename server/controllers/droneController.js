// server/controllers/droneController.js
const Drone = require('../models/droneModel');
const Mission = require('../models/missionModel');

// @desc    Create a new drone
// @route   POST /api/drones
// @access  Private
const createDrone = async (req, res) => {
  try {
    const {
      name,
      serialNumber,
      model,
      status,
      batteryLevel,
      maxFlightTime
    } = req.body;

    // Check if a drone with this serial number already exists
    const droneExists = await Drone.findOne({ serialNumber });
    if (droneExists) {
      return res.status(400).json({ message: 'A drone with this serial number already exists' });
    }

    // Add the current user to the drone
    const drone = await Drone.create({
      name,
      serialNumber,
      model,
      status: status || 'available',
      batteryLevel: batteryLevel || 100,
      maxFlightTime,
      user: req.user.id
    });

    res.status(201).json(drone);
  } catch (error) {
    console.error('Error creating drone:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all drones for current user
// @route   GET /api/drones
// @access  Private
const getDrones = async (req, res) => {
  try {
    // Find drones belonging to the current user
    // Admins can see all drones, others see only their own
    const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
    
    const drones = await Drone.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json(drones);
  } catch (error) {
    console.error('Error fetching drones:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available drones for mission planning
// @route   GET /api/drones/available
// @access  Private
const getAvailableDrones = async (req, res) => {
  try {
    const { startDateTime, endDateTime } = req.query;
    
    if (!startDateTime) {
      return res.status(400).json({ message: 'Start date and time is required' });
    }
    
    // Find all drones that are marked as available
    const availableDrones = await Drone.find({ 
      user: req.user.id,
      status: 'available'
    });
    
    if (startDateTime && endDateTime) {
      // Find all missions that overlap with the provided timeframe
      const overlappingMissions = await Mission.find({
        'schedule.dateTime': { 
          $lte: new Date(endDateTime) 
        },
        status: { $in: ['scheduled', 'in-progress'] }
      });
      
      // Filter out drones that are already assigned to missions in this timeframe
      const bookedDroneIds = overlappingMissions.map(mission => 
        mission.drone ? mission.drone.toString() : null
      ).filter(id => id !== null);
      
      const filteredDrones = availableDrones.filter(
        drone => !bookedDroneIds.includes(drone._id.toString())
      );
      
      return res.status(200).json(filteredDrones);
    }
    
    // If no time range is specified, return all available drones
    res.status(200).json(availableDrones);
  } catch (error) {
    console.error('Error fetching available drones:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single drone by ID
// @route   GET /api/drones/:id
// @access  Private
const getDroneById = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);

    if (!drone) {
      return res.status(404).json({ message: 'Drone not found' });
    }

    // Check if user has permission to view this drone
    if (drone.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this drone' });
    }

    res.status(200).json(drone);
  } catch (error) {
    console.error('Error fetching drone:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a drone
// @route   PUT /api/drones/:id
// @access  Private
const updateDrone = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);

    if (!drone) {
      return res.status(404).json({ message: 'Drone not found' });
    }

    // Check if user has permission to update this drone
    if (drone.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this drone' });
    }

    // If updating the serial number, check if it's unique
    if (req.body.serialNumber && req.body.serialNumber !== drone.serialNumber) {
      const droneExists = await Drone.findOne({ serialNumber: req.body.serialNumber });
      if (droneExists) {
        return res.status(400).json({ message: 'A drone with this serial number already exists' });
      }
    }

    const updatedDrone = await Drone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedDrone);
  } catch (error) {
    console.error('Error updating drone:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a drone
// @route   DELETE /api/drones/:id
// @access  Private
const deleteDrone = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);

    if (!drone) {
      return res.status(404).json({ message: 'Drone not found' });
    }

    // Check if user has permission to delete this drone
    if (drone.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this drone' });
    }

    // Check if drone is currently assigned to any active missions
    const activeMissions = await Mission.find({ 
      drone: req.params.id,
      status: { $in: ['scheduled', 'in-progress'] }
    });

    if (activeMissions.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete a drone that is assigned to active missions' 
      });
    }

    await drone.deleteOne();

    res.status(200).json({ id: req.params.id, message: 'Drone removed' });
  } catch (error) {
    console.error('Error deleting drone:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDrone,
  getDrones,
  getAvailableDrones,
  getDroneById,
  updateDrone,
  deleteDrone
};