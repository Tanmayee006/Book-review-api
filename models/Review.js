const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  bookId: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Ensure one review per user per book
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

// Update book's average rating after review operations
reviewSchema.statics.calculateAverageRating = async function(bookObjectId) {
  const stats = await this.aggregate([
    {
      $match: { book: bookObjectId }
    },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const Book = mongoose.model('Book');
  
  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookObjectId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount
    });
  } else {
    await Book.findByIdAndUpdate(bookObjectId, {
      averageRating: 0,
      reviewCount: 0
    });
  }
};

// Hooks to update average rating
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.book);
});

reviewSchema.post('remove', function() {
  this.constructor.calculateAverageRating(this.book);
});

module.exports = mongoose.model('Review', reviewSchema);