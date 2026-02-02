const express = require('express');
const router = express.Router();
const { handleRazorpayWebhook } = require('../controllers/webhook.controller');

// No JWT auth here as it's a public webhook from Razorpay
router.post('/razorpay', handleRazorpayWebhook);

module.exports = router;
