const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Show = require('../models/Show');

// @desc    Get all theatres with optional city/search filter
// @route   GET /api/theatres
// @access  Public
const getTheatres = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const query = { isActive: true };

    if (city && city !== 'All') {
      query.city = new RegExp(city, 'i');
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const theatres = await Theatre.find(query).sort({ rating: -1, name: 1 });

    res.json({
      success: true,
      count: theatres.length,
      theatres
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single theatre by ID with screens and current shows
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found'
      });
    }

    const screens = await Screen.find({ theatre: theatre._id });
    const today = new Date().toISOString().split('T')[0];

    const shows = await Show.find({
      theatre: theatre._id,
      showDate: { $gte: today },
      status: { $ne: 'Cancelled' }
    })
      .populate('movie', 'title posterUrl duration rating genre language certification')
      .populate('screen', 'name screenType')
      .sort({ showDate: 1, showTime: 1 });

    res.json({
      success: true,
      theatre,
      screens,
      shows
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get distinct cities
// @route   GET /api/theatres/meta/cities
// @access  Public
const getCities = async (req, res, next) => {
  try {
    const cities = await Theatre.distinct('city', { isActive: true });
    res.json({
      success: true,
      cities
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new theatre
// @route   POST /api/theatres
// @access  Private/Admin
const createTheatre = async (req, res, next) => {
  try {
    const { name, brand, city, location, address, totalScreens, facilities, image } = req.body;

    const theatre = await Theatre.create({
      name,
      brand: brand || 'IMovies Cinemas',
      city,
      location,
      address,
      totalScreens: totalScreens || 3,
      facilities: facilities || [
        'Dolby Atmos 7.1',
        'Laser 4K Projection',
        'Recliner Seating Available',
        'Food & Beverages'
      ],
      image: image || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'
    });

    // Auto-create default screens for this theatre
    const screenCount = Number(totalScreens) || 3;
    const screenTypes = ['IMAX 3D', '4DX', 'Dolby Cinema', '2D', '3D'];

    for (let i = 1; i <= screenCount; i++) {
      await Screen.create({
        theatre: theatre._id,
        screenNumber: i,
        name: `Audi ${i} - ${screenTypes[(i - 1) % screenTypes.length]}`,
        screenType: screenTypes[(i - 1) % screenTypes.length],
        totalSeats: 60,
        rows: ['A', 'B', 'C', 'D', 'E', 'F'],
        seatsPerRow: 10
      });
    }

    res.status(201).json({
      success: true,
      message: 'Theatre and screens created successfully',
      theatre
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update theatre details
// @route   PUT /api/theatres/:id
// @access  Private/Admin
const updateTheatre = async (req, res, next) => {
  try {
    let theatre = await Theatre.findById(req.params.id);

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found'
      });
    }

    theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Theatre updated successfully',
      theatre
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete theatre
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found'
      });
    }

    await Screen.deleteMany({ theatre: theatre._id });
    await Theatre.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Theatre and associated screens deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTheatres,
  getTheatreById,
  getCities,
  createTheatre,
  updateTheatre,
  deleteTheatre
};
