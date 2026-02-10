const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    const {
        category,
        weaveType,
        tag,
        occasion,
        collection,
        minPrice,
        maxPrice,
        isActive,
        limit,
        search
    } = req.query;

    let query = {};

    if (search) {
        const cleanSearch = search.trim();
        query.$or = [
            { name: { $regex: cleanSearch, $options: 'i' } },
            { description: { $regex: cleanSearch, $options: 'i' } }
        ];
    }

    if (category) query.category = category;
    if (weaveType) query.weaveType = weaveType;
    if (tag) query.tags = { $in: [tag] };
    if (occasion) query.occasions = { $in: [occasion] };
    if (collection) query.collections = { $in: [collection] };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let productQuery = Product.find(query).populate('category', 'name type').sort('-createdAt');

    if (limit) {
        productQuery = productQuery.limit(Number(limit));
    }

    const products = await productQuery;
    res.json(products);
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category', 'name type');

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    const {
        name,
        description,
        price,
        discountedPrice,
        category,
        weaveType,
        stock,
        tags,
        occasions,
        collections,
        images
    } = req.body;

    const product = new Product({
        name,
        description,
        price,
        discountedPrice,
        category,
        weaveType,
        stock,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
        occasions: occasions || [],
        collections: collections || [],
        images: images || [],
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    const {
        name,
        description,
        price,
        discountedPrice,
        category,
        weaveType,
        stock,
        tags,
        occasions,
        collections,
        images,
        isActive
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price ?? product.price;
        product.discountedPrice = discountedPrice ?? product.discountedPrice;
        product.category = category || product.category;
        product.weaveType = weaveType || product.weaveType;
        product.stock = stock ?? product.stock;
        product.isActive = isActive ?? product.isActive;
        product.occasions = occasions || product.occasions;
        product.collections = collections || product.collections;

        if (tags) {
            product.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
        }

        if (images) {
            product.images = images;
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
