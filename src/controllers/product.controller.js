const Product = require('../models/Product');

// ─── Field projection: never expose unused internal fields to the client ───
const LIST_PROJECTION = 'name price discountedPrice category weaveType images stock isActive occasions collections tags createdAt';

// @desc    Get all products (paginated)
// @route   GET /api/products?page=1&limit=20
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
        search
    } = req.query;

    // ── Pagination ──────────────────────────────────────────────────────────
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // ── Build Filter ────────────────────────────────────────────────────────
    let query = {};

    if (search) {
        const cleanSearch = search.trim();
        // Use MongoDB text index when available; fall back to regex for partial match
        query.$text = { $search: cleanSearch };
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

    // ── Execute (lean + select + paginate) ─────────────────────────────────
    const [products, total] = await Promise.all([
        Product.find(query)
            .select(LIST_PROJECTION)
            .populate('category', 'name type')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .lean(),  // Plain JS objects — no Mongoose overhead
        Product.countDocuments(query)
    ]);

    // ── HTTP Cache: public product listings can be cached for 60 s ─────────
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');

    res.json({
        products,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    });
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id)
        .select('-__v')
        .populate('category', 'name type')
        .lean();

    if (product) {
        // Individual product pages can also be cached briefly
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
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
