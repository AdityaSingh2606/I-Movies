const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true
    },
    seatNumber: {
      type: String,
      required: true
    },
    row: {
      type: String,
      required: true
    },
    number: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      enum: ['Silver', 'Gold', 'Platinum'],
      default: 'Gold'
    },
    basePriceMultiplier: {
      type: Number,
      default: 1.0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

seatSchema.index({ screen: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
