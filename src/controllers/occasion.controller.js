const Occasion = require('../models/Occasion');

// @desc    Get all occasions
// @route   GET /api/occasions
// @access  Public
const getOccasions = async (req, res) => {
    try {
        const filter = req.query.isActive === 'true' ? { isActive: true } : {};
        const occasions = await Occasion.find(filter).sort({ sortOrder: 1, createdAt: -1 });
        res.json(occasions);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create an occasion
// @route   POST /api/occasions
// @access  Private/Admin
const createOccasion = async (req, res) => {
    try {
        const occasion = new Occasion(req.body);
        const created = await occasion.save();
        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Invalid data' });
    }
};

// @desc    Update an occasion
// @route   PUT /api/occasions/:id
// @access  Private/Admin
const updateOccasion = async (req, res) => {
    try {
        const occasion = await Occasion.findById(req.params.id);
        if (occasion) {
            Object.assign(occasion, req.body);
            const updated = await occasion.save();
            res.json(updated);
        } else {
            res.status(404).json({ message: 'Occasion not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message || 'Invalid data' });
    }
};

// @desc    Delete an occasion
// @route   DELETE /api/occasions/:id
// @access  Private/Admin
const deleteOccasion = async (req, res) => {
    try {
        const occasion = await Occasion.findById(req.params.id);
        if (occasion) {
            await occasion.deleteOne();
            res.json({ message: 'Occasion removed' });
        } else {
            res.status(404).json({ message: 'Occasion not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getOccasions,
    createOccasion,
    updateOccasion,
    deleteOccasion
};
