const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0,
    },
    discountedPrice: {
        type: Number,
        min: 0,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    weaveType: {
        type: String,
        trim: true,
    },
    images: [{
        type: String, // Cloudinary URLs
    }],
    stock: {
        type: Number,
        required: true,
        default: 1,
    },
    tags: {
        type: [String],
        default: [],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    occasions: {
        type: [String],
        default: [],
    },
    collections: {
        type: [String],
        default: [],
    }
}, { timestamps: true });


// Auto-disable product when stock = 0
productSchema.pre('save', function () {
    if (this.stock <= 0) {
        this.isActive = false;
    }
});

module.exports = mongoose.model('Product', productSchema);
