const rateLimit = require('express-rate-limit');

/**
 * Admin Login Rate Limiter
 * Protection against brute-force on admin credentials
 */
const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,                    // 3 attempts per window
    message: {
        message: 'Too many login attempts. Please try again after some time.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Customer Login Rate Limiter
 * Tighter limit than the general API to deter credential stuffing
 */
const customerLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 attempts per IP per window
    message: {
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Order Tracking Rate Limiter
 * Protection against order ID enumeration and scraping
 */
const orderTrackLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,                   // 5 tracking requests per minute per IP
    message: {
        message: 'Too many tracking attempts. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Payment API Rate Limiter
 * Protection against payment spam and gateway abuse
 * Note: Razorpay webhooks are on a separate route and excluded from this limiter.
 */
const paymentApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,                  // 10 payment-related requests per minute per IP
    message: {
        message: 'Action restricted due to high frequency. Please try again in a minute.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * General Public API Limiter
 * Applied globally to all public GET endpoints — prevents scraping and DoS
 * 100 requests per minute is comfortable for a real user, tight for a bot
 */
const generalApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,                 // 100 requests per IP per minute
    message: {
        message: 'Too many requests. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip limiter for admin-authenticated requests to avoid blocking dashboard
        return req.headers['x-admin-bypass'] === process.env.ADMIN_BYPASS_SECRET;
    }
});

module.exports = {
    adminLoginLimiter,
    customerLoginLimiter,
    orderTrackLimiter,
    paymentApiLimiter,
    generalApiLimiter,
};
