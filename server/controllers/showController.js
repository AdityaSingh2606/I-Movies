const Show = require('../models/Show');
const Screen = require('../models/Screen');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const seatLockService = require('../services/seatLockService');

// Helper to generate seat matrix for a screen
const generateSeatsForScreen = (screen, ticketPrices) => {
  const seats = [];
  const rows = screen.rows || ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatsPerRow = screen.seatsPerRow || 10;

  // Category layout:
  // Rows A, B: Silver
  // Rows C, D, E: Gold
  // Row F: Platinum
  rows.forEach((rowLetter, index) => {
    let category = 'Gold';
    let price = ticketPrices.gold || 250;

    if (index < 2) {
      category = 'Silver';
      price = ticketPrices.silver || 180;
    } else if (index === rows.length - 1) {
      category = 'Platinum';
      price = ticketPrices.platinum || 350;
    }

    for (let num = 1; num <= seatsPerRow; num++) {
      seats.push({
        seatNumber: `${rowLetter}${num}`,
        row: rowLetter,
        number: num,
        category,
        price,
        status: 'available',
        lockedBy: null,
        lockedAt: null,
        lockExpiresAt: null,
        bookedBy: null,
        bookingId: null
      });
    }
  });

  return seats;
};

// @desc    Get shows with filters
// @route   GET /api/shows
// @access  Public
const getShows = async (req, res, next) => {
  try {
    const { movie, theatre, date, city } = req.query;
    const query = { status: { $ne: 'Cancelled' } };

    if (movie) query.movie = movie;
    if (theatre) query.theatre = theatre;
    if (date) query.showDate = date;

    let shows = await Show.find(query)
      .populate('movie', 'title posterUrl duration rating genre language certification')
      .populate('theatre', 'name city location brand facilities')
      .populate('screen', 'name screenType totalSeats')
      .sort({ showDate: 1, showTime: 1 });

    if (city && city !== 'All') {
      shows = shows.filter(
        (show) => show.theatre && show.theatre.city.toLowerCase() === city.toLowerCase()
      );
    }

    res.json({
      success: true,
      count: shows.length,
      shows
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get show details by ID with current seat availability
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res, next) => {
  try {
    // Clean expired locks first
    await seatLockService.cleanShowExpiredLocks(req.params.id);

    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre')
      .populate('screen');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    res.json({
      success: true,
      show
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new show
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res, next) => {
  try {
    const { movie, theatre, screen, showDate, showTime, ticketPrices } = req.body;

    if (!movie || !theatre || !screen || !showDate || !showTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movie, theatre, screen, date, and showtime'
      });
    }

    const screenDoc = await Screen.findById(screen);
    if (!screenDoc) {
      return res.status(404).json({
        success: false,
        message: 'Screen not found'
      });
    }

    const prices = ticketPrices || {
      silver: 180,
      gold: 250,
      platinum: 350
    };

    const seats = generateSeatsForScreen(screenDoc, prices);

    const show = await Show.create({
      movie,
      theatre,
      screen,
      showDate,
      showTime,
      ticketPrices: prices,
      status: 'Scheduled',
      seats
    });

    const populatedShow = await Show.findById(show._id)
      .populate('movie', 'title')
      .populate('theatre', 'name')
      .populate('screen', 'name');

    res.status(201).json({
      success: true,
      message: 'Show created successfully',
      show: populatedShow
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update show details
// @route   PUT /api/shows/:id
// @access  Private/Admin
const updateShow = async (req, res, next) => {
  try {
    let show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    const { showDate, showTime, status, ticketPrices } = req.body;

    if (showDate) show.showDate = showDate;
    if (showTime) show.showTime = showTime;
    if (status) show.status = status;
    if (ticketPrices) {
      show.ticketPrices = ticketPrices;
      // Update seat prices for available seats
      show.seats.forEach((seat) => {
        if (seat.status === 'available') {
          if (seat.category === 'Silver') seat.price = ticketPrices.silver || seat.price;
          if (seat.category === 'Gold') seat.price = ticketPrices.gold || seat.price;
          if (seat.category === 'Platinum') seat.price = ticketPrices.platinum || seat.price;
        }
      });
    }

    await show.save();

    res.json({
      success: true,
      message: 'Show updated successfully',
      show
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a show
// @route   DELETE /api/shows/:id
// @access  Private/Admin
const cancelShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    show.status = 'Cancelled';
    await show.save();

    res.json({
      success: true,
      message: 'Show cancelled successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getShows,
  getShowById,
  createShow,
  updateShow,
  cancelShow
};
