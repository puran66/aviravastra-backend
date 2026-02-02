const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        enum: ['OCCASION', 'WEAVE'],
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
