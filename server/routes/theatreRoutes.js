const express = require('express');
const router = express.Router();
const {
  getTheatres,
  getTheatreById,
  getCities,
  createTheatre,
  updateTheatre,
  deleteTheatre
} = require('../controllers/theatreController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getTheatres);
router.get('/meta/cities', getCities);
router.get('/:id', getTheatreById);

// Admin theatre management
router.post('/', protect, adminOnly, createTheatre);
router.put('/:id', protect, adminOnly, updateTheatre);
router.delete('/:id', protect, adminOnly, deleteTheatre);

module.exports = router;
