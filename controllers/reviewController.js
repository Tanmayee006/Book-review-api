const Review = require('../models/Review');
const Book = require('../models/Book');

const addReview = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    let book;
    
    // Check if it's a number (sequential ID) or MongoDB ObjectId
    if (/^\d+$/.test(bookId)) {
      // Sequential ID
      book = await Book.findOne({ bookId: parseInt(bookId) });
    } else {
      // MongoDB ObjectId
      book = await Book.findById(bookId);
    }

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user has already reviewed this book
    const existingReview = await Review.findOne({
      book: book._id, // Always use MongoDB _id for relationships
      user: userId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book'
      });
    }

    // Create review
    const review = await Review.create({
      book: book._id, // MongoDB ObjectId for relationship
      bookId: book.bookId, // Sequential ID for reference
      user: userId,
      rating,
      comment
    });

    // Populate user data
    await review.populate('user', 'username');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: { review }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    // Find review (still using MongoDB ObjectId for reviews)
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update review
    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Populate user data
    await review.populate('user', 'username');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user._id;

    // Find review
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    // Delete review
    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    next(error);
  }
};


module.exports = {
  addReview,
  updateReview,
  deleteReview
};