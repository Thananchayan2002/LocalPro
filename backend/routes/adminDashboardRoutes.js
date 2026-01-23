const express = require('express');
const {
  getDashboardSummary,
  getMonthlyRevenue,
  getBookingsByService,
  getMonthlyBookingsComparison
} = require ('../controllers/adminDashboardController.js');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get("/summary",protect, getDashboardSummary);
router.get("/monthly-revenue",protect, getMonthlyRevenue);
router.get("/monthly-booking",protect, getMonthlyBookingsComparison);
router.get("/bookings-by-service",protect, getBookingsByService);

module.exports = router;
