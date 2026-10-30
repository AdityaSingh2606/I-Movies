const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  getFeaturedMovies,
  createMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movieController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getMovies);
router.get('/spotlight/featured', getFeaturedMovies);
router.get('/:id', getMovieById);

// Admin movie management
router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

module.exports = router;
