const express = require('express');
const router = express.Router();
const {
  processPayment,
  getPaymentByBookingId
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/process', protect, processPayment);
router.get('/booking/:bookingId', protect, getPaymentByBookingId);

module.exports = router;
