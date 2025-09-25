const express = require('express');
const {
  addBook,
  getAllBooks,
  getBookById,
  searchBooks
} = require('../controllers/bookController');
const { addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validateBookInput, validateReviewInput } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getAllBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);

// Protected routes
router.post('/', protect, validateBookInput, addBook);
router.post('/:id/reviews', protect, validateReviewInput, addReview);

module.exports = router;