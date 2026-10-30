const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Get comprehensive dashboard metrics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMovies = await Movie.countDocuments();
    const totalTheatres = await Theatre.countDocuments({ isActive: true });
    const totalShows = await Show.countDocuments({ status: { $ne: 'Cancelled' } });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });

    // Calculate total revenue from confirmed bookings
    const revenueAgg = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Recent 8 bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('movie', 'title posterUrl')
      .populate('theatre', 'name city')
      .sort({ createdAt: -1 })
      .limit(8);

    // Revenue by movie
    const movieRevenue = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      {
        $group: {
          _id: '$movie',
          revenue: { $sum: '$totalAmount' },
          bookingsCount: { $sum: 1 },
          ticketsSold: { $sum: '$seatCount' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    const populatedMovieRevenue = await Promise.all(
      movieRevenue.map(async (item) => {
        const movie = await Movie.findById(item._id).select('title posterUrl');
        return {
          title: movie ? movie.title : 'Unknown Movie',
          poster: movie ? movie.posterUrl : '',
          revenue: item.revenue,
          bookingsCount: item.bookingsCount,
          ticketsSold: item.ticketsSold
        };
      })
    );

    // Booking Trends for the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));

      const dayBookings = await Booking.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        bookingStatus: 'confirmed'
      });

      const dayRevenueAgg = await Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            bookingStatus: 'confirmed'
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      last7Days.push({
        date: dateStr.slice(5), // MM-DD
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(dateStr).getDay()],
        bookings: dayBookings,
        revenue: dayRevenueAgg.length > 0 ? dayRevenueAgg[0].total : 0
      });
    }

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalMovies,
        totalTheatres,
        totalShows,
        totalBookings,
        confirmedBookings,
        totalRevenue
      },
      recentBookings,
      topMovies: populatedMovieRevenue,
      bookingTrends: last7Days
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings with search and filters for admin
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.bookingStatus = status;
    }

    if (search) {
      query.bookingReference = { $regex: search, $options: 'i' };
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('movie', 'title posterUrl duration')
      .populate('theatre', 'name city location')
      .populate('payment')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all payment transactions for admin audit
// @route   GET /api/admin/payments
// @access  Private/Admin
const getAllPayments = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.transactionId = { $regex: search, $options: 'i' };
    }

    const payments = await Payment.find(query)
      .populate('user', 'name email phone')
      .populate({
        path: 'booking',
        select: 'bookingReference showDate showTime totalAmount'
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAllBookings,
  getAllPayments
};
