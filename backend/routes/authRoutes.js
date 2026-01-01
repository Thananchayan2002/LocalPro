const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/register (customer signup)
router.post('/register', authController.register);

// POST /api/auth/logout
router.post('/logout', protect, authController.logout);

// POST /api/auth/verify-credentials
router.post('/verify-credentials', protect, authController.verifyCredentials);

// PUT /api/auth/update-phone
router.put('/update-phone', protect, authController.updatePhone);

// PUT /api/auth/update-email (deprecated - kept for backward compatibility)
router.put('/update-email', protect, authController.updateEmail);

// PUT /api/auth/update-password
router.put('/update-password', protect, authController.updatePassword);

module.exports = router;
