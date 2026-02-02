const Collection = require('../models/Collection');

// @desc    Get all collections
// @route   GET /api/collections
// @access  Public
const getCollections = async (req, res) => {
    try {
        const filter = req.query.isActive === 'true' ? { isActive: true } : {};
        const collections = await Collection.find(filter).sort({ sortOrder: 1, createdAt: -1 });
        res.json(collections);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a collection
// @route   POST /api/collections
// @access  Private/Admin
const createCollection = async (req, res) => {
    try {
        const collection = new Collection(req.body);
        const created = await collection.save();
        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Invalid data' });
    }
};

// @desc    Update a collection
// @route   PUT /api/collections/:id
// @access  Private/Admin
const updateCollection = async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id);
        if (collection) {
            Object.assign(collection, req.body);
            const updated = await collection.save();
            res.json(updated);
        } else {
            res.status(404).json({ message: 'Collection not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message || 'Invalid data' });
    }
};

// @desc    Delete a collection
// @route   DELETE /api/collections/:id
// @access  Private/Admin
const deleteCollection = async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id);
        if (collection) {
            await collection.deleteOne();
            res.json({ message: 'Collection removed' });
        } else {
            res.status(404).json({ message: 'Collection not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCollections,
    createCollection,
    updateCollection,
    deleteCollection
};
