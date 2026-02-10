# Avira Vastra - Backend API

Backend API for Avira Vastra, a premium Indian saree e-commerce platform.

**Last Updated**: February 3, 2026  
**Status**: Production Ready ✅

## 🚀 Features

- **Authentication**: Google OAuth & JWT-based authentication
- **Product Management**: CRUD operations for sarees and collections
- **Order Management**: Complete order processing system
- **Image Management**: Cloudinary integration for image uploads
- **Payment Integration**: Razorpay payment gateway
- **Admin Panel**: Admin routes for managing products and orders

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js (Google OAuth), JWT
- **Image Storage**: Cloudinary
- **Payment**: Razorpay

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/puran66/aviravastra-backend.git
cd aviravastra-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
- MongoDB connection string
- JWT secret
- Cloudinary credentials
- Google OAuth credentials
- Razorpay credentials (if using)

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in .env)

## 📁 Project Structure

```
backend/
├── src/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── config/          # Configuration files
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── generated-images/    # AI-generated product images
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore rules
└── package.json        # Dependencies and scripts
```

## 🔑 Environment Variables

See `.env.example` for all required environment variables.

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/verify` - Verify JWT token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details

### Collections & Occasions
- `GET /api/collections` - Get all collections
- `GET /api/occasions` - Get all occasions

## 🔒 Security

- JWT-based authentication
- CORS configuration
- Environment variables for sensitive data
- Input validation and sanitization

## 📝 License

MIT

## 👥 Author

Puran66

## 🔗 Links

- Frontend: [Avira Vastra Frontend](https://aviravastra.vercel.app)
- Backend API: Deployed on your hosting service
