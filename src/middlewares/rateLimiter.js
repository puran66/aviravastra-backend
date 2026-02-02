const rateLimit = require('express-rate-limit');

/**
 * Admin Login Rate Limiter
 * Protection against brute-force on admin credentials
 */
const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 login attempts per window
    message: {
        message: 'Too many login attempts. Please try again after some time.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Order Tracking Rate Limiter
 * Protection against order ID enumeration and scraping
 */
const orderTrackLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 tracking requests per minute
    message: {
        message: 'Too many tracking attempts. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Payment API Rate Limiter
 * Protection against payment spam and gateway abuse
 * Note: Razorpay webhooks are handled on a different route and should NOT be limited here.
 */
const paymentApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 payment-related requests per minute
    message: {
        message: 'Action restricted due to high frequency. Please try again in a minute.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    adminLoginLimiter,
    orderTrackLimiter,
    paymentApiLimiter
};
