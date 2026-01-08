const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Customer routes (protected)
router.post('/create', protect, bookingController.createBooking);
router.get('/my-bookings', protect, bookingController.getCustomerBookings);
router.put('/cancel/:id', protect, bookingController.cancelBooking);

// Professional routes (protected)
router.get('/professional-bookings', protect, bookingController.getProfessionalBookings);
router.get('/professional-details/:phone', protect, bookingController.getProfessionalByPhone);
router.post('/complete-booking', protect, bookingController.completeBooking);

// Admin routes (protected)
router.get('/all', protect, bookingController.getAllBookings);
router.get('/all-detailed', protect, bookingController.getAllBookingsDetailed);
router.put('/update-status/:id', protect, bookingController.updateBookingStatus);
router.delete('/:id', protect, bookingController.deleteBooking);

// Common routes (protected)
router.get('/:id', protect, bookingController.getBookingById);

module.exports = router;
