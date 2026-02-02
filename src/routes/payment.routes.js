const express = require('express');
const router = express.Router();
const { verifyPayment } = require('../controllers/payment.controller');
const { paymentApiLimiter } = require('../middlewares/rateLimiter');

router.post('/verify', paymentApiLimiter, verifyPayment);


module.exports = router;
