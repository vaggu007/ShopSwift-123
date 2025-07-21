# ShopSwift - Progressive Web Application E-commerce Platform

A modern, full-stack e-commerce Progressive Web Application (PWA) built with React.js, Node.js, Express.js, and MongoDB. ShopSwift provides a complete e-commerce solution with advanced features including real-time inventory management, secure payment processing, file uploads, and comprehensive admin tools.

## 🚀 Features

### Frontend (PWA)
- **Progressive Web App** - Installable, offline-capable, and responsive
- **Modern React.js** - Built with React 18+ and modern hooks
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Shopping Cart & Wishlist** - Persistent cart and wishlist functionality
- **User Authentication** - Secure login, registration, and profile management
- **Product Catalog** - Advanced filtering, search, and sorting
- **Checkout Process** - Multi-step checkout with payment integration
- **Order Management** - Order history and tracking
- **Category Navigation** - Hierarchical category browsing

### Backend API
- **RESTful API** - Comprehensive REST API with proper HTTP methods
- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **Role-based Access Control** - Admin, moderator, and user roles
- **Payment Integration** - Stripe payment processing with webhooks
- **File Upload** - Cloudinary integration for image management
- **Email Services** - Nodemailer with HTML email templates
- **Rate Limiting** - API protection against abuse
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Centralized error handling with custom error responses
- **API Documentation** - Swagger/OpenAPI documentation

### Database & Models
- **MongoDB with Mongoose** - Robust data modeling and validation
- **User Management** - Complete user profiles with addresses and preferences
- **Product Management** - Products with variants, reviews, and inventory tracking
- **Order System** - Comprehensive order management with status tracking
- **Category System** - Hierarchical categories with breadcrumbs
- **Review System** - Product reviews and ratings

## 🛠️ Tech Stack

### Frontend
- **React.js** - Frontend library
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Third-party Services
- **Stripe** - Payment processing
- **Cloudinary** - Image and video management
- **Nodemailer** - Email sending service

### Security & Middleware
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting
- **Express Validator** - Input validation

## 📁 Project Structure

```
shopswift-pwa/
├── client/                     # Frontend React PWA
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   └── sw.js             # Service worker
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React context providers
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   └── App.js           # Main App component
│   └── package.json
│
├── server/                     # Backend Node.js API
│   ├── config/                # Configuration files
│   │   ├── database.js       # MongoDB connection
│   │   ├── cloudinary.js     # Cloudinary setup
│   │   ├── stripe.js         # Stripe configuration
│   │   └── swagger.js        # API documentation
│   ├── controllers/          # Route controllers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   ├── userController.js
│   │   ├── uploadController.js
│   │   └── paymentController.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js          # Authentication middleware
│   │   └── errorHandler.js  # Error handling
│   ├── models/              # Mongoose models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   └── Order.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── users.js
│   │   ├── orders.js
│   │   ├── upload.js
│   │   └── payments.js
│   ├── scripts/             # Utility scripts
│   │   └── seed.js          # Database seeding
│   ├── utils/               # Utility functions
│   │   ├── errorResponse.js
│   │   ├── auth.js
│   │   └── sendEmail.js
│   ├── .env.example         # Environment variables template
│   ├── server.js            # Main server file
│   └── package.json
│
└── README.md                   # This file
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Environment Variables

Create a `.env` file in the server directory based on `.env.example`:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/shopswift

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRE=30d

# Email Configuration (Nodemailer)
EMAIL_FROM=noreply@shopswift.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Session Configuration
SESSION_SECRET=your_session_secret_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880

# Admin User (for seeding)
ADMIN_EMAIL=admin@shopswift.com
ADMIN_PASSWORD=Admin123!@#
```

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/shopswift-pwa.git
   cd shopswift-pwa
   ```

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables:**
   ```bash
   cd ../server
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start MongoDB:**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

6. **Seed the database (optional):**
   ```bash
   cd server
   node scripts/seed.js
   ```

7. **Start the development servers:**

   **Backend (Terminal 1):**
   ```bash
   cd server
   npm run dev
   ```

   **Frontend (Terminal 2):**
   ```bash
   cd client
   npm start
   ```

8. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

## 📖 API Documentation

The API is fully documented using Swagger/OpenAPI 3.0. Access the interactive documentation at:
- **Swagger UI**: http://localhost:5000/api-docs
- **JSON Schema**: http://localhost:5000/api-docs.json

### API Endpoints Overview

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

#### Products
- `GET /api/products` - Get all products (with filtering, sorting, pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

#### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/tree` - Get category tree
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

#### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/cancel` - Cancel order

#### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/payment-methods` - Get saved payment methods
- `POST /api/payments/webhook` - Stripe webhook

#### File Upload
- `POST /api/upload/products/:id/images` - Upload product images (Admin)
- `POST /api/upload/avatar` - Upload user avatar
- `DELETE /api/upload/avatar` - Delete user avatar

## 🔐 Authentication & Authorization

The API uses JWT (JSON Web Tokens) for authentication with the following features:
- Access tokens (short-lived, 7 days)
- Refresh tokens (long-lived, 30 days)
- HTTP-only cookies for secure token storage
- Role-based access control (user, admin, moderator)
- Account verification via email
- Password reset functionality
- Account lockout after failed attempts

## 💳 Payment Integration

Stripe integration includes:
- Payment intents for secure card processing
- Saved payment methods
- Webhook handling for payment events
- Refund processing
- Multiple currency support
- Strong Customer Authentication (SCA) compliance

## 📁 File Upload System

Cloudinary integration provides:
- Image optimization and transformation
- Multiple image sizes for responsive design
- Secure upload with file type validation
- Automatic format conversion (WebP, AVIF)
- CDN delivery for fast loading

## 🧪 Testing

### Running Tests

**Backend tests:**
```bash
cd server
npm test
```

**Frontend tests:**
```bash
cd client
npm test
```

### Test Coverage
- Unit tests for controllers and utilities
- Integration tests for API endpoints
- Frontend component testing with React Testing Library

## 🚀 Deployment

### Backend Deployment (Node.js)

1. **Environment Setup:**
   - Set production environment variables
   - Configure MongoDB Atlas or production database
   - Set up Stripe production keys
   - Configure Cloudinary production settings

2. **Build and Deploy:**
   ```bash
   cd server
   npm install --production
   npm start
   ```

### Frontend Deployment (PWA)

1. **Build the PWA:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to hosting service:**
   - Netlify, Vercel, or similar
   - Configure build settings and environment variables
   - Set up proper redirects for SPA routing

### Production Checklist
- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] SSL certificates installed
- [ ] CDN configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Rate limiting configured
- [ ] Security headers enabled

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React.js team for the amazing frontend library
- Express.js team for the robust backend framework
- MongoDB team for the flexible database
- Stripe for secure payment processing
- Cloudinary for image management
- All open-source contributors

## 📞 Support

For support, email support@shopswift.com or create an issue in the GitHub repository.

## 🔄 Changelog

### Version 1.0.0 (Current)
- Initial release with complete e-commerce functionality
- PWA capabilities with offline support
- Stripe payment integration
- Cloudinary file upload system
- Comprehensive API documentation
- Admin dashboard with analytics
- Email notification system
- Advanced product filtering and search

---

**Built with ❤️ by the ShopSwift Team**
