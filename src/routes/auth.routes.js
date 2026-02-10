const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getProfile, updateProfile } = require('../controllers/auth.controller');
const { protectCustomer } = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

router.route('/profile')
    .get(protectCustomer, getProfile)
    .put(protectCustomer, updateProfile);

module.exports = router;
