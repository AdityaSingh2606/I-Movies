const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Notification = require('../models/Notification');
const seatLockService = require('../services/seatLockService');
const generateQRCode = require('../utils/qrCodeGenerator');

// Generate unique transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TXN-${timestamp}${random}`;
};

// @desc    Process simulated payment
// @route   POST /api/payments/process
// @access  Private
const processPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod, paymentDetails, simulateFailure } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId'
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate('movie')
      .populate('theatre')
      .populate('show');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.bookingStatus === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been paid and confirmed'
      });
    }

    const transactionId = generateTransactionId();

    // CASE 1: SIMULATED PAYMENT FAILURE
    if (simulateFailure === true) {
      const failedPayment = await Payment.create({
        transactionId,
        booking: booking._id,
        user: req.user._id,
        amount: booking.totalAmount,
        paymentMethod: paymentMethod || 'UPI',
        paymentDetails: paymentDetails || {},
        status: 'failed',
        isDemo: true,
        errorMessage: 'Simulated payment gateway timeout or insufficient funds'
      });

      booking.payment = failedPayment._id;
      booking.paymentStatus = 'failed';
      await booking.save();

      // Release reserved seats on failed payment
      const seatNumbers = booking.seats.map((s) => s.seatNumber);
      await seatLockService.unlockSeats(booking.show._id, seatNumbers, req.user._id);

      // Create notification
      await Notification.create({
        user: req.user._id,
        title: 'Payment Simulation Failed ⚠️',
        message: `Your payment of ₹${booking.totalAmount} for ${booking.movie.title} failed. Seats have been released. You may try again.`,
        type: 'payment',
        referenceId: booking.bookingReference
      });

      return res.status(400).json({
        success: false,
        message: 'Payment simulation failed. Your seats have been released. You can re-select seats and retry.',
        transactionId,
        payment: failedPayment
      });
    }

    // CASE 2: SUCCESSFUL PAYMENT SIMULATION
    const payment = await Payment.create({
      transactionId,
      booking: booking._id,
      user: req.user._id,
      amount: booking.totalAmount,
      paymentMethod: paymentMethod || 'UPI',
      paymentDetails: paymentDetails || {},
      status: 'success',
      isDemo: true
    });

    // Generate QR code for digital ticket
    const qrCode = await generateQRCode({
      bookingReference: booking.bookingReference,
      movieTitle: booking.movie.title,
      theatreName: booking.theatre.name,
      showDate: booking.showDate,
      showTime: booking.showTime,
      seats: booking.seats.map((s) => s.seatNumber).join(', '),
      totalAmount: booking.totalAmount
    });

    // Confirm booking
    booking.payment = payment._id;
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    booking.qrCode = qrCode;
    await booking.save();

    // Mark seats as permanently booked on the show
    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    await seatLockService.confirmBookingOnSeats(booking.show._id, seatNumbers, req.user._id, booking._id);

    // Create success notification
    await Notification.create({
      user: req.user._id,
      title: 'Booking Confirmed! 🎟️',
      message: `Your tickets for ${booking.movie.title} at ${booking.theatre.name} (${booking.seats.map((s) => s.seatNumber).join(', ')}) are confirmed. Enjoy the show!`,
      type: 'booking',
      referenceId: booking.bookingReference
    });

    const confirmedBooking = await Booking.findById(booking._id)
      .populate('movie')
      .populate('theatre')
      .populate('payment');

    res.json({
      success: true,
      message: 'Payment simulated successfully! Booking is confirmed.',
      booking: confirmedBooking,
      payment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get payment details by booking ID
// @route   GET /api/payments/booking/:bookingId
// @access  Private
const getPaymentByBookingId = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId })
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No payment record found for this booking'
      });
    }

    res.json({
      success: true,
      payment
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  processPayment,
  getPaymentByBookingId
};
