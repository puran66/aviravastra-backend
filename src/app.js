const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');
const paymentRoutes = require('./routes/payment.routes');
const customerRoutes = require('./routes/customer.routes');
const authRoutes = require('./routes/auth.routes');
const contentRoutes = require('./routes/content.routes');
const occasionRoutes = require('./routes/occasion.routes.js');
const collectionRoutes = require('./routes/collection.routes.js');
const webhookRoutes = require('./routes/webhook.routes');




const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration - Allow both localhost and IP-based development
const allowedOrigins = [
    'http://localhost:5173',
    'http://192.168.29.176:5173',
    'http://localhost:3000', // For future admin panel
    "https://aviravastra.vercel.app"
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) return callback(null, true);

        // Remove trailing slash if present for comparison
        const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

        if (allowedOrigins.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            console.warn(`🚫 CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/occasions', occasionRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/webhooks', webhookRoutes);




// Welcome Route
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Welcome to Avira Vastra API',
        version: '1.0.0',
        endpoints: {
            products: '/api/products',
            categories: '/api/categories',
            orders: '/api/orders',
            collections: '/api/collections',
            occasions: '/api/occasions',
            auth: '/api/auth',
            health: '/health'
        },
        documentation: 'https://github.com/puran66/aviravastra-backend'
    });
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'success', message: 'AviraVastra API is running' });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
