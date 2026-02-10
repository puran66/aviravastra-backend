const express = require('express');
const router = express.Router();
const {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} = require('../controllers/category.controller');
const { protectAdmin } = require('../middlewares/auth.middleware');

router.route('/')
    .get(getCategories)
    .post(protectAdmin, createCategory);

router.route('/:id')
    .put(protectAdmin, updateCategory)
    .delete(protectAdmin, deleteCategory);

module.exports = router;
