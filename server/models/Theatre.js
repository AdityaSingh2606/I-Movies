const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add theatre name'],
      trim: true
    },
    brand: {
      type: String,
      default: 'IMovies Cinemas'
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location / Mall / Area is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Complete address is required']
    },
    totalScreens: {
      type: Number,
      default: 3
    },
    facilities: {
      type: [String],
      default: [
        'Dolby Atmos 7.1',
        'Laser 4K Projection',
        'Recliner Seating Available',
        'Gourmet Food & Beverages',
        'Free Parking',
        'Wheelchair Friendly'
      ]
    },
    rating: {
      type: Number,
      default: 4.6
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'
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

theatreSchema.index({ city: 1, name: 1 });

module.exports = mongoose.model('Theatre', theatreSchema);
