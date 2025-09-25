const express = require('express');
const { updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validateReviewInput } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.put('/:id', protect, validateReviewInput, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;