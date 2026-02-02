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

// Connect to Database
connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`🌐 Accessible at:`);
        console.log(`   - http://localhost:${PORT}`);
        console.log(`   - http://192.168.29.176:${PORT}`);
    });
});
