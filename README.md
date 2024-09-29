# Video Rental Management System

## Overview

VidRent is a RESTful API for managing video rentals, built with Node.js and Express. This system allows you to manage customers, genres, movies, rentals, and users with full CRUD functionality, authentication, and authorization.

  <img src="./img/MainScreen1.png" alt="Image 1" width="700" height="400" style="display: inline-block;"/>
<div>
  <img src="./img/MainScreen2.png" alt="Image 2" width="700" height="400" style="display: inline-block;"/>
</div>

## Table of Contents

- Features
- Prerequisites
- Installation
- Configuration
- Running the Application
- API Endpoints
- Testing
- Technologies Used
- Contributing
- License
- Acknowledgements

## Features

- Customer Management: Create, read, update, and delete customers.
- Genre Management: Manage movie genres.
- Movie Management: Handle movie details, stock, and rental rates.
- Rentals: Process movie rentals and returns.
- User Authentication & Authorization: Secure endpoints with JWT and role-based access control.
- Input Validation: Validate requests using Joi and custom middleware.
- Error Handling: Centralized error handling.
- Comprehensive Testing: Includes tests for routes, middleware, and models.

## Prerequisites

- Node.js v12 or higher
- MongoDB v4 or higher
- npm

### Installation

1. **Clone the Repository**

```bash
git clone https://github.com/EngenMe/video-rental-management.git
cd video-rental-management
```

2. **Install dependencies**

```bash
npm install
```

## Configuration

1. **Set Environment Variables**

Create a `.env` file in the root directory and add the following:

```bash
PORT=3000
MONGODB_URI=mongodb://localhost/video-rental
JWT_SECRET=your_jwt_secret
```

Replace `your_jwt_secret` with a secure secret key.

2. **Database Setup**

Ensure MongoDB is running and accessible via the `MONGODB_URI` provided.

## Running the Application

- Start the server

```bash
npm start
```

The API will be running at `http://localhost:3000`.

- Development Mode with Nodemon

```bash
npm run dev
```

This will start the server with Nodemon for automatic restarts on code changes.

## API Endpoints

### Customers

- GET `/api/customers` - Retrieve all customers.
- GET `/api/customers/:id` - Retrieve a customer by ID.
- POST `/api/customers` - Create a new customer. (Requires Auth)
- PUT `/api/customers/:id` - Update a customer. (Requires Auth)
- DELETE `/api/customers/:id` - Delete a customer. (Requires Admin)

### Genres

- GET `/api/genres` - Retrieve all genres.
- GET `/api/genres/:id` - Retrieve a genre by ID.
- POST `/api/genres` - Create a new genre. (Requires Auth)
- PUT `/api/genres/:id` - Update a genre. (Requires Auth)
- DELETE `/api/genres/:id` - Delete a genre. (Requires Admin)

### Movies

- GET `/api/movies` - Retrieve all movies.
- GET `/api/movies/:id` - Retrieve a movie by ID.
- POST `/api/movies` - Create a new movie. (Requires Auth)
- PUT `/api/movies/:id` - Update a movie. (Requires Auth)
- DELETE `/api/movies/:id` - Delete a movie. (Requires Admin)

### Rentals

- POST `/api/rentals` - Create a new rental. (Requires Auth)
- POST `/api/returns` - Process a return. (Requires Auth)

### Users

- GET `/api/users/me` - Get current user details. (Requires Auth)
- POST `/api/users` - Register a new user.

### Authentication

- POST `/api/auth` - Authenticate a user and obtain a JWT.

## Testing

- Run Tests

```bash
npm test
```

This command runs all tests, including those for routes, middleware, and models.

## Technologies Used

- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB with Mongoose
- Authentication: JSON Web Tokens (JWT)
- Validation: Joi
- Testing: Jest and Supertest
- Utilities: Lodash, bcrypt, dotenv

## Contributing

Feel free to fork the repository and submit pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License - see the **`[LICENSE](LICENSE)`** file for details.

## Acknowledgments

A special thanks to Mosh Hamedani for his excellent Node.js courses, which provided invaluable guidance and insights throughout the process of building this application. His practical teaching approach helped me gain a deeper understanding of Node.js, Express, and RESTful API development, which were essential in creating this project.

You can check out his courses on **[Code with Mosh](https://codewithmosh.com/)**.
