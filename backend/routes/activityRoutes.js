const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const activityController = require("../controllers/activityController");

// GET /api/activities - list my activities
router.get("/", protect, activityController.getMyActivities);

// POST /api/activities - create activity
router.post("/", protect, activityController.createActivity);

module.exports = router;
