const mongoose = require('mongoose');
const dns = require('dns');

// ── DNS Fix ──────────────────────────────────────────────────────────────────
// The local/ISP DNS fails to resolve MongoDB Atlas SRV records (_mongodb._tcp.*).
// Force Node.js to use Google (8.8.8.8) + Cloudflare (1.1.1.1) DNS instead.
// This does NOT affect system-wide DNS — only this Node.js process.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
        });

        if (process.env.NODE_ENV !== 'production') {
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        }
    } catch (error) {
        console.error(`[DB Error] ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

