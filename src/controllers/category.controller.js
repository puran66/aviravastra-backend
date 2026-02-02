const Category = require('../models/Category');
const slugify = require('slugify');

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    const { name, type } = req.body;

    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    const category = await Category.create({
        name,
        type,
        slug: slugify(name, { lower: true }),
    });

    res.status(201).json(category);
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    const categories = await Category.find({});
    res.json(categories);
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    const { name, type } = req.body;

    const category = await Category.findById(req.params.id);

    if (category) {
        category.name = name || category.name;
        category.type = type || category.type;
        category.slug = name ? slugify(name, { lower: true }) : category.slug;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        await category.deleteOne();
        res.json({ message: 'Category removed' });
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
};
