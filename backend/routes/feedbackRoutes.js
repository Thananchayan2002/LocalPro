const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const { protect } = require("../middleware/authMiddleware");

// Public routes (no authentication needed)
router.get("/featured", feedbackController.getFeaturedFeedback);
router.post("/create", feedbackController.createFeedback);

// Protected routes (require authentication)
router.get("/all", protect, feedbackController.getAllFeedback);
router.get("/stats", protect, feedbackController.getFeedbackStats);
router.patch("/:id/read", protect, feedbackController.markAsRead);

module.exports = router;
