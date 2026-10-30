const mongoose = require('mongoose');

const seatInShowSchema = new mongoose.Schema(
  {
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
    price: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available'
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    lockedAt: {
      type: Date,
      default: null
    },
    lockExpiresAt: {
      type: Date,
      default: null
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null
    }
  },
  { _id: true }
);

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true
    },
    showDate: {
      type: String,
      required: [true, 'Show date is required (YYYY-MM-DD)'],
      index: true
    },
    showTime: {
      type: String,
      required: [true, 'Show time is required (e.g. 07:15 PM)']
    },
    ticketPrices: {
      silver: { type: Number, default: 180 },
      gold: { type: Number, default: 250 },
      platinum: { type: Number, default: 350 }
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Filling Fast', 'Almost Full', 'Housefull', 'Cancelled'],
      default: 'Scheduled'
    },
    seats: [seatInShowSchema]
  },
  {
    timestamps: true
  }
);

showSchema.index({ movie: 1, showDate: 1 });
showSchema.index({ theatre: 1, showDate: 1 });

module.exports = mongoose.model('Show', showSchema);
