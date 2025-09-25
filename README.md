# Book Review API

A RESTful API for managing books and reviews built with Node.js, Express.js, and MongoDB. Users can register, authenticate, add books, and write reviews with rating functionality.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Design Decisions](#design-decisions)
- [Postman Collection](#postman-collection)

## ✨ Features

- **User Authentication**: JWT-based registration and login
- **Book Management**: Add, view, search books with pagination
- **Review System**: Rate and review books (1-5 stars)
- **Sequential Book IDs**: User-friendly sequential IDs alongside MongoDB ObjectIds
- **Search Functionality**: Search books by title or author
- **Data Validation**: Comprehensive input validation and error handling
- **Security**: Helmet, CORS, rate limiting, and password hashing
- **Pagination**: Efficient pagination for books and reviews

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, cors, express-rate-limit
- **Validation**: Custom middleware validation

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd book-review-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see section below)

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/book-review-api
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/book-review-api

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server Configuration
NODE_ENV=development
PORT=5000
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or your specified PORT).

### Health Check
Once running, verify the server is working:
```bash
curl http://localhost:5000/api/health
```

## 📖 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "64f7b8c9e1234567890abcde",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Book Endpoints

#### Get All Books (Public)
```http
GET /api/books?page=0&size=10&author=tolkien&genre=fantasy
```

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Items per page (default: 10)
- `author` (optional): Filter by author name
- `genre` (optional): Filter by genre

#### Search Books (Public)
```http
GET /api/books/search?q=lord of the rings&page=0&size=5
```

#### Get Book by ID (Public)
```http
GET /api/books/1  Or
GET /api/books/64f7b8c9e1234567890abcde
```

#### Add New Book (Protected)
```http
POST /api/books
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "The Lord of the Rings",
  "author": "J.R.R. Tolkien",
  "genre": "Fantasy",
  "description": "An epic fantasy novel about a hobbit's journey to destroy the One Ring.",
  "publishedYear": 1954,
  "isbn": "9780547928227"
}
```

### Review Endpoints

#### Add Review (Protected)
```http
POST /api/books/1/reviews
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Absolutely amazing book! A masterpiece of fantasy literature."
}
```

#### Update Review (Protected)
```http
PUT /api/reviews/64f7b8c9e1234567890abcde
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Great book, but a bit lengthy for my taste."
}
```

#### Delete Review (Protected)
```http
DELETE /api/reviews/64f7b8c9e1234567890abcde
Authorization: Bearer <your-jwt-token>
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, 3-30 chars),
  email: String (unique, valid email),
  password: String (hashed, min 6 chars),
  createdAt: Date,
  updatedAt: Date
}
```

### Books Collection
```javascript
{
  _id: ObjectId,
  bookId: Number (sequential, unique),
  title: String (max 200 chars),
  author: String (max 100 chars),
  genre: String (max 50 chars),
  description: String (max 2000 chars),
  publishedYear: Number (1000-current year),
  isbn: String (optional, unique),
  addedBy: ObjectId (ref: User),
  averageRating: Number (0-5),
  reviewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Reviews Collection
```javascript
{
  _id: ObjectId,
  book: ObjectId (ref: Book),
  bookId: Number (for reference),
  user: ObjectId (ref: User),
  rating: Number (1-5),
  comment: String (max 1000 chars),
  createdAt: Date,
  updatedAt: Date
}
```

### Counters Collection
```javascript
{
  _id: String ("book_id"),
  sequence_value: Number
}
```

### Relationships
- One User can add many Books (1:N)
- One User can write many Reviews (1:N)
- One Book can have many Reviews (1:N)
- One User can review one Book only once (1:1 constraint)

## 🎯 Design Decisions

### 1. **Dual ID System**
- **MongoDB ObjectId**: Used for internal relationships and database operations
- **Sequential bookId**: User-friendly incremental IDs (1, 2, 3...) for public APIs
- **Benefits**: Better UX with simple IDs while maintaining MongoDB performance

### 2. **Authentication Strategy**
- JWT tokens for stateless authentication
- Password hashing with bcryptjs (salt rounds: 12)
- Token expiration (7 days default)
- Bearer token authorization header

### 3. **Data Validation**
- **Two-layer validation**: Mongoose schema + custom middleware
- **Comprehensive error handling**: Validation, duplicate keys, cast errors
- **Input sanitization**: Trim whitespace, case normalization

### 4. **Review System**
- **One review per user per book**: Prevents spam and maintains data integrity
- **Automatic rating calculation**: Book's average rating updates via middleware
- **User ownership**: Only review authors can update/delete their reviews

### 5. **Pagination Strategy**
- **Offset-based pagination**: Simple page/size parameters
- **Metadata included**: Total pages, items, navigation flags
- **Performance optimization**: MongoDB skip/limit with proper indexing

### 6. **Search Implementation**
- **Text-based search**: MongoDB text indices on title and author
- **Case-insensitive**: Regex-based flexible matching
- **Combined with filtering**: Author and genre filters

### 7. **Security Measures**
- **Rate limiting**: 100 requests per 15 minutes per IP
- **CORS enabled**: Cross-origin resource sharing
- **Helmet**: Security headers
- **Input limits**: JSON payload limit (10mb)

### 8. **Error Handling**
- **Centralized error middleware**: Consistent error responses
- **Detailed error messages**: Development vs production modes
- **HTTP status codes**: Proper REST conventions

## 📮 Example API Requests (Postman)

### Setting up Postman
1. Create a new collection called "Book Review API"
2. Set environment variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: (will be set after login)

### Authentication Examples

#### 1. Register User
```
Method: POST
URL: {{baseUrl}}/auth/signup
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### 2. Login User
```
Method: POST
URL: {{baseUrl}}/auth/login
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "email": "john@example.com",
  "password": "password123"
}

Test Script (to save token automatically):
if (pm.response.json().data.token) {
  pm.environment.set('token', pm.response.json().data.token);
}
```

### Book Management Examples

#### 3. Get All Books (with pagination)
```
Method: GET
URL: {{baseUrl}}/books?page=0&size=10&author=tolkien&genre=fantasy
```

#### 4. Search Books
```
Method: GET
URL: {{baseUrl}}/books/search?q=lord of rings&page=0&size=5
```

#### 5. Get Book by ID
```
Method: GET
URL: {{baseUrl}}/books/1
```

#### 6. Add New Book (Protected)
```
Method: POST
URL: {{baseUrl}}/books
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (raw JSON):
{
  "title": "The Lord of the Rings",
  "author": "J.R.R. Tolkien",
  "genre": "Fantasy",
  "description": "An epic fantasy novel about a hobbit's journey to destroy the One Ring.",
  "publishedYear": 1954,
  "isbn": "9780547928227"
}
```

### Review Management Examples

#### 7. Add Review (Protected)
```
Method: POST
URL: {{baseUrl}}/books/1/reviews
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (raw JSON):
{
  "rating": 5,
  "comment": "Absolutely amazing book! A masterpiece of fantasy literature."
}
```

#### 8. Update Review (Protected)
```
Method: PUT
URL: {{baseUrl}}/reviews/REVIEW_ID_HERE
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (raw JSON):
{
  "rating": 4,
  "comment": "Great book, but a bit lengthy for my taste."
}
```

#### 9. Delete Review (Protected)
```
Method: DELETE
URL: {{baseUrl}}/reviews/REVIEW_ID_HERE
Headers:
  Authorization: Bearer {{token}}
```

### Testing Workflow
1. **Register** a new user (or login with existing)
2. **Copy the token** from the response and save it in Postman environment
3. **Add a book** using the protected endpoint
4. **Get all books** to see your added book with sequential ID
5. **Add a review** to your book
6. **Get book by ID** to see the review included
7. **Update or delete** your review as needed

## 🚀 Deployment

### Environment Setup
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/book-review-api
JWT_SECRET=your-production-secret-key
JWT_EXPIRE=7d
PORT=5000
```

### Production Considerations
- Use MongoDB Atlas for production database
- Implement proper logging (Winston, Morgan)
- Add API documentation (Swagger/OpenAPI)
- Set up monitoring and health checks
- Configure proper CORS origins
- Use environment-specific rate limits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Coding! 📚✨**
