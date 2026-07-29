const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  getUsers,
  updateUserRole,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);

// Admin-only user management
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;
