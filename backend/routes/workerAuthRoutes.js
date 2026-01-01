const express = require('express');
const router = express.Router();
const { login, updatePassword } = require('../controllers/workerAuthController');
const { getAvailability, updateAvailability } = require('../controllers/workerAvailabilityController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/worker/login
router.post('/login', login);

// PUT /api/worker/update-password
router.put('/update-password', protect, updatePassword);

// GET /api/worker/availability/:professionalId
router.get('/availability/:professionalId', protect, getAvailability);

// PUT /api/worker/availability/:professionalId
router.put('/availability/:professionalId', protect, updateAvailability);

module.exports = router;
