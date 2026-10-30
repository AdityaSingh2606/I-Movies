const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema(
  {
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true
    },
    screenNumber: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true,
      default: 'Audi 1'
    },
    screenType: {
      type: String,
      enum: ['2D', '3D', 'IMAX 3D', '4DX', 'Dolby Cinema'],
      default: '2D'
    },
    totalSeats: {
      type: Number,
      default: 60
    },
    rows: {
      type: [String],
      default: ['A', 'B', 'C', 'D', 'E', 'F']
    },
    seatsPerRow: {
      type: Number,
      default: 10
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Screen', screenSchema);
