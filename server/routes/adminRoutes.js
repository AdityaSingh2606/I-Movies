const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllBookings,
  getAllPayments
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', protect, adminOnly, getDashboardStats);
router.get('/bookings', protect, adminOnly, getAllBookings);
router.get('/payments', protect, adminOnly, getAllPayments);

module.exports = router;
