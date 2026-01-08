const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const pushNotificationController = require('../controllers/pushNotificationController');

// Get VAPID public key (no auth required)
router.get('/vapid-public-key', pushNotificationController.getPublicKey);

// Subscribe to push notifications
router.post('/subscribe', protect, pushNotificationController.subscribe);

// Unsubscribe from push notifications
router.post('/unsubscribe', protect, pushNotificationController.unsubscribe);

module.exports = router;
