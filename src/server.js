require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = require('./app');
const connectDB = require('./config/db');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


const PORT = process.env.PORT || 5000;
const { cleanupExpiredOrders } = require('./controllers/order.controller');

// Connect to Database
connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`🚀 Server ready in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
            console.log(`🔗 Local: http://localhost:${PORT}`);
        } else {
            console.log(`🚀 Server running on port ${PORT}`);
        }

        // Start Periodic Stock Cleanup (Every 15 minutes)
        setInterval(cleanupExpiredOrders, 15 * 60 * 1000);
        // Initial run on startup
        cleanupExpiredOrders();
    });
});
