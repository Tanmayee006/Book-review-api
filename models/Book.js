const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  bookId: {
    type: Number,
    unique: true,
  },
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
    maxlength: [50, 'Genre cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  publishedYear: {
    type: Number,
    required: [true, 'Published year is required'],
    min: [1000, 'Please enter a valid year'],
    max: [new Date().getFullYear(), 'Year cannot be in the future']
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Function to get next sequence number
const getNextSequence = async function(name) {
  const Counter = mongoose.model('Counter');
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence_value;
};

// Pre-save middleware to generate sequential ID
bookSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      this.bookId = await getNextSequence('book_id');
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Index for search functionality
bookSchema.index({ title: 'text', author: 'text' });
bookSchema.index({ bookId: 1 }); // Index for sequential ID

module.exports = mongoose.model('Book', bookSchema);
