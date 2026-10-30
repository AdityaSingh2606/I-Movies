const express = require('express');
const router = express.Router();
const {
  getShows,
  getShowById,
  createShow,
  updateShow,
  cancelShow
} = require('../controllers/showController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getShows);
router.get('/:id', getShowById);

// Admin show management
router.post('/', protect, adminOnly, createShow);
router.put('/:id', protect, adminOnly, updateShow);
router.delete('/:id', protect, adminOnly, cancelShow);

module.exports = router;
