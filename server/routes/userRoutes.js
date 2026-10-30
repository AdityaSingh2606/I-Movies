const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUserRole,
  toggleUserStatus
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getAllUsers);
router.put('/:id/role', protect, adminOnly, updateUserRole);
router.put('/:id/toggle-status', protect, adminOnly, toggleUserStatus);

module.exports = router;
