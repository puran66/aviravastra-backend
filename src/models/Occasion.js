const mongoose = require('mongoose');

const occasionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    subtitle: {
        type: String,
        trim: true,
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    image: {
        type: String, // Cloudinary URL
        required: [true, 'Image is required'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    sortOrder: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

module.exports = mongoose.model('Occasion', occasionSchema);
