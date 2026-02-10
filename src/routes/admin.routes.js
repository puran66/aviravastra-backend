const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile, getCustomers, getDashboardStats } = require('../controllers/admin.controller');
const { protectAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { loginSchema } = require('../validators/auth.validator');
const { adminLoginLimiter } = require('../middlewares/rateLimiter');

router.post('/login', adminLoginLimiter, validate(loginSchema), loginAdmin);

router.get('/profile', protectAdmin, getAdminProfile);
router.get('/customers', protectAdmin, getCustomers);
router.get('/stats', protectAdmin, getDashboardStats);



module.exports = router;
