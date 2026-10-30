const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a movie title'],
      trim: true
    },
    posterUrl: {
      type: String,
      required: [true, 'Please provide a poster image URL']
    },
    bannerUrl: {
      type: String,
      required: [true, 'Please provide a banner/backdrop image URL']
    },
    description: {
      type: String,
      required: [true, 'Please add a description / synopsis']
    },
    genre: {
      type: [String],
      required: [true, 'Please specify at least one genre']
    },
    language: {
      type: [String],
      required: [true, 'Please specify available languages']
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required']
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required']
    },
    cast: [
      {
        name: { type: String, required: true },
        role: { type: String, default: 'Actor' },
        photo: { type: String, default: '' }
      }
    ],
    director: {
      type: String,
      required: [true, 'Director name is required']
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.5
    },
    voteCount: {
      type: Number,
      default: 1500
    },
    certification: {
      type: String,
      enum: ['U', 'UA', 'A', 'R', 'PG-13'],
      default: 'UA'
    },
    trailerUrl: {
      type: String,
      required: [true, 'YouTube trailer URL or embed URL is required']
    },
    status: {
      type: String,
      enum: ['Now Showing', 'Coming Soon'],
      default: 'Now Showing'
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Text index for search with language_override configured so array 'language' does not conflict
movieSchema.index(
  { title: 'text', description: 'text', director: 'text' },
  { language_override: 'dummyLanguageField' }
);

module.exports = mongoose.model('Movie', movieSchema);
