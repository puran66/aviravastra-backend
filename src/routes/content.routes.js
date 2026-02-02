const express = require('express');
const router = express.Router();
const { getContent, updateContent } = require('../controllers/content.controller');
const { protectAdmin } = require('../middlewares/auth.middleware');

// Public route to get content for frontend
router.get('/', getContent);

// Protected admin route to update content
router.put('/', protectAdmin, updateContent);

module.exports = router;
