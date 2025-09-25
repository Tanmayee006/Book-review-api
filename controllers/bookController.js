const Book = require("../models/Book");
const Review = require("../models/Review");
const Counter = require("../models/Counter"); 

async function getNextBookId() {
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: "book_id" },
      {
        $inc: { sequence_value: 0 }
      },
      { new: true, upsert: true }
    );
    return counter.sequence_value;
  } catch (error) {
    console.error("Error generating book ID:", error);
    throw error;
  }
}

const addBook = async (req, res, next) => {
  try {
    console.log("Creating new book...");

    // Generate sequential ID first
    const bookId = await getNextBookId();
    console.log("Generated bookId:", bookId);

    const bookData = {
      ...req.body,
      bookId: bookId, 
      addedBy: req.user._id,
    };

    const book = await Book.create(bookData);

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: {
        book: {
          id: book.bookId, // Sequential ID for easy use
          _id: book._id, // MongoDB ID for internal use
          ...book.toObject(),
        },
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.isbn) {
        return res.status(400).json({
          success: false,
          message: "Book with this ISBN already exists",
        });
      }
    }
    next(error);
  }
};

const getAllBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const { author, genre } = req.query;

    // Build filter object
    const filter = {};
    if (author) {
      filter.author = { $regex: author, $options: "i" };
    }
    if (genre) {
      filter.genre = { $regex: genre, $options: "i" };
    }

    // Calculate pagination
    const skip = page * size;

    // Get books with pagination
    const books = await Book.find(filter)
      .populate("addedBy", "username")
      .sort({ bookId: 1 }) // Sort by sequential ID
      .limit(size)
      .skip(skip);

    // Get total count for pagination
    const totalItems = await Book.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / size);

    // Transform response to show sequential ID as main ID
    const booksWithSequentialId = books.map((book) => ({
      id: book.bookId,
      _id: book._id,
      ...book.toObject(),
    }));

    res.status(200).json({
      success: true,
      data: {
        books: booksWithSequentialId,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          pageSize: size,
          hasNext: page < totalPages - 1,
          hasPrev: page > 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 5;

    let book;

    // Check if it's a number (sequential ID) or MongoDB ObjectId
    if (/^\d+$/.test(bookId)) {
      // Sequential ID (number)
      book = await Book.findOne({ bookId: parseInt(bookId) }).populate(
        "addedBy",
        "username"
      );
    } else {
      // MongoDB ObjectId
      book = await Book.findById(bookId).populate("addedBy", "username");
    }

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Get reviews with pagination using MongoDB _id
    const skip = page * size;
    const reviews = await Review.find({ book: book._id })
      .populate("user", "username")
      .sort({ createdAt: -1 })
      .limit(size)
      .skip(skip);

    const totalReviews = await Review.countDocuments({ book: book._id });
    const totalPages = Math.ceil(totalReviews / size);

    res.status(200).json({
      success: true,
      data: {
        book: {
          id: book.bookId,
          _id: book._id,
          ...book.toObject(),
        },
        reviews,
        reviewsPagination: {
          currentPage: page,
          totalPages,
          totalItems: totalReviews,
          pageSize: size,
          hasNext: page < totalPages - 1,
          hasPrev: page > 0,
        },
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }
    next(error);
  }
};
const searchBooks = async (req, res, next) => {
  try {
    const { q, page = 0, size = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const pageNum = parseInt(page);
    const pageSize = parseInt(size);
    const skip = pageNum * pageSize;

    // Search using regex
    const searchFilter = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
      ],
    };

    const books = await Book.find(searchFilter)
      .populate("addedBy", "username")
      .sort({ bookId: 1 })
      .limit(pageSize)
      .skip(skip);

    const totalItems = await Book.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalItems / pageSize);

    // Transform response
    const booksWithSequentialId = books.map((book) => ({
      id: book.bookId,
      _id: book._id,
      ...book.toObject(),
    }));

    res.status(200).json({
      success: true,
      data: {
        books: booksWithSequentialId,
        searchQuery: q,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          pageSize,
          hasNext: pageNum < totalPages - 1,
          hasPrev: pageNum > 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addBook,
  getAllBooks,
  getBookById,
  searchBooks,
};
