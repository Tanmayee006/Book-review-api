const validateBookInput = (req, res, next) => {
  const { title, author, genre, description, publishedYear } = req.body;
  
  const errors = {};

  if (!title || title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (title.length > 200) {
    errors.title = 'Title cannot exceed 200 characters';
  }

  if (!author || author.trim().length === 0) {
    errors.author = 'Author is required';
  } else if (author.length > 100) {
    errors.author = 'Author name cannot exceed 100 characters';
  }

  if (!genre || genre.trim().length === 0) {
    errors.genre = 'Genre is required';
  } else if (genre.length > 50) {
    errors.genre = 'Genre cannot exceed 50 characters';
  }

  if (!description || description.trim().length === 0) {
    errors.description = 'Description is required';
  } else if (description.length > 2000) {
    errors.description = 'Description cannot exceed 2000 characters';
  }

  if (!publishedYear) {
    errors.publishedYear = 'Published year is required';
  } else if (publishedYear < 1000 || publishedYear > new Date().getFullYear()) {
    errors.publishedYear = 'Please enter a valid year';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

const validateReviewInput = (req, res, next) => {
  const { rating, comment } = req.body;
  
  const errors = {};

  if (!rating) {
    errors.rating = 'Rating is required';
  } else if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    errors.rating = 'Rating must be an integer between 1 and 5';
  }

  if (!comment || comment.trim().length === 0) {
    errors.comment = 'Comment is required';
  } else if (comment.length > 1000) {
    errors.comment = 'Comment cannot exceed 1000 characters';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

module.exports = {
  validateBookInput,
  validateReviewInput
};