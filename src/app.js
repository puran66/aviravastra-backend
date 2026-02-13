const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
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

// Set trust proxy for Render/Vercel load balancers
app.set('trust proxy', 1);

// Security & Optimization Middleware
app.use(helmet());
app.use(compression()); // Compress all responses for better performance

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    "https://aviravastra.vercel.app",
    process.env.FRONTEND_URL // Allow dynamically from ENV
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin.endsWith('/') ? origin.slice(0, -1) : origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging (Only in development)
if (process.env.NODE_ENV !== 'production') {
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
