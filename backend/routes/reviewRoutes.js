const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Submit review and payment
router.post('/submit', protect, reviewController.submitReview);

// Check if booking can be reviewed
router.get('/can-review/:bookingId', protect, reviewController.canReview);

// Get reviews for a professional by phone (public endpoint)
router.get('/professional-phone/:phone', reviewController.getProfessionalReviewsByPhone);

// Get reviews for a professional
router.get('/professional/:professionalId', reviewController.getProfessionalReviews);

module.exports = router;
