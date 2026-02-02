const express = require('express');
const router = express.Router();
const { googleLogin, getProfile, updateProfile } = require('../controllers/auth.controller');
const { protectCustomer } = require('../middlewares/auth.middleware');

router.post('/google', googleLogin);

router.route('/profile')
    .get(protectCustomer, getProfile)
    .put(protectCustomer, updateProfile);

module.exports = router;
