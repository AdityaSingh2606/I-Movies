const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking'],
      default: 'UPI'
    },
    paymentDetails: {
      upiId: { type: String, default: '' },
      cardLast4: { type: String, default: '' },
      cardNetwork: { type: String, default: '' },
      bankName: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'refunded', 'pending'],
      default: 'pending'
    },
    isDemo: {
      type: Boolean,
      default: true
    },
    errorMessage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
