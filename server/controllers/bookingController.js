const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Notification = require('../models/Notification');
const seatLockService = require('../services/seatLockService');
const generateQRCode = require('../utils/qrCodeGenerator');

// Generate unique booking reference (e.g. IMV-749201)
const generateBookingReference = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `IMV-${randomNum}`;
};

// @desc    Initiate booking / Lock seats & create pending booking
// @route   POST /api/bookings/initiate
// @access  Private
const createBookingIntent = async (req, res, next) => {
  try {
    const { showId, seatNumbers } = req.body;

    if (!showId || !seatNumbers || !seatNumbers.length) {
      return res.status(400).json({
        success: false,
        message: 'Please provide showId and at least one seat to book'
      });
    }

    const show = await Show.findById(showId)
      .populate('movie')
      .populate('theatre')
      .populate('screen');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    // Attempt to lock seats on server
    const lockResult = await seatLockService.lockSeats(showId, seatNumbers, req.user._id);

    // Calculate pricing
    let subtotal = 0;
    const bookedSeatsDetails = [];

    show.seats.forEach((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        subtotal += seat.price;
        bookedSeatsDetails.push({
          seatNumber: seat.seatNumber,
          category: seat.category,
          price: seat.price
        });
      }
    });

    const convenienceFee = seatNumbers.length * 30; // ₹30 per seat
    const gst = Math.round((subtotal + convenienceFee) * 0.18); // 18% GST
    const totalAmount = subtotal + convenienceFee + gst;

    const bookingReference = generateBookingReference();

    const booking = await Booking.create({
      bookingReference,
      user: req.user._id,
      movie: show.movie._id,
      theatre: show.theatre._id,
      show: show._id,
      screenName: show.screen.name,
      seats: bookedSeatsDetails,
      seatCount: seatNumbers.length,
      subtotal,
      convenienceFee,
      gst,
      totalAmount,
      showDate: show.showDate,
      showTime: show.showTime,
      paymentStatus: 'pending',
      bookingStatus: 'pending'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie', 'title posterUrl duration rating')
      .populate('theatre', 'name city location brand');

    res.status(201).json({
      success: true,
      message: 'Seats reserved successfully for checkout',
      booking: populatedBooking,
      lockExpiresAt: lockResult.expiresAt
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings for logged-in user
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title posterUrl duration genre rating certificate')
      .populate('theatre', 'name city location address brand')
      .populate('show', 'showDate showTime')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get booking by ID or Reference
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { bookingReference: req.params.id.toUpperCase() };

    const booking = await Booking.findOne(query)
      .populate('movie')
      .populate('theatre')
      .populate('show')
      .populate('user', 'name email phone')
      .populate('payment');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization (must be booking owner or admin)
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie', 'title')
      .populate('theatre', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Calculate simulated refund (Ticket amount refunded, convenience fee retained)
    const refundAmount = booking.subtotal;

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancelledAt = new Date();
    booking.refundAmount = refundAmount;

    await booking.save();

    // Release seats in show
    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    await seatLockService.releaseBookedSeats(booking.show, seatNumbers);

    // Create user notification
    await Notification.create({
      user: booking.user,
      title: 'Booking Cancelled & Refund Initiated',
      message: `Your booking for ${booking.movie.title} (${booking.bookingReference}) has been cancelled. A simulated refund of ₹${refundAmount} has been processed.`,
      type: 'cancellation',
      referenceId: booking.bookingReference
    });

    res.json({
      success: true,
      message: `Booking cancelled successfully. Simulated refund of ₹${refundAmount} initiated.`,
      booking
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBookingIntent,
  getMyBookings,
  getBookingById,
  cancelBooking
};
