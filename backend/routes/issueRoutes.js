const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');

// Issue routes
router.get('/', protect, issueController.getAllIssues);
router.get('/:id', protect, issueController.getIssueById);
router.post('/', protect, issueController.createIssue);
router.put('/:id', protect, issueController.updateIssue);
router.delete('/:id', protect, issueController.deleteIssue);

module.exports = router;
