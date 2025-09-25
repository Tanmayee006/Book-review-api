const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');

// Route imports
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const reviewRoutes = require('./routes/reviews');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Handle undefined routes - FIXED: No wildcard pattern
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  let message = error.message || 'Server Error';
  let statusCode = error.statusCode || 500;

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    message = Object.values(error.errors).map(val => val.message);
    statusCode = 400;
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 400;
  }

  // JWT error
  if (error.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Server Error' : message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});