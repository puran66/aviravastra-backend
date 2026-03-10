const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getProfile, updateProfile } = require('../controllers/auth.controller');
const { protectCustomer } = require('../middlewares/auth.middleware');
const { customerLoginLimiter } = require('../middlewares/rateLimiter');

router.post('/register', customerLoginLimiter, register);
router.post('/login', customerLoginLimiter, login);
router.post('/google', customerLoginLimiter, googleLogin);

router.route('/profile')
    .get(protectCustomer, getProfile)
    .put(protectCustomer, updateProfile);

module.exports = router;

