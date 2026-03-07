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
    },

    // ── Product Page Detail Fields ──────────────────────────────────────────
    // All optional — shown on the product detail page, managed via the admin panel
    fabric: {
        type: String,
        trim: true,
        default: '',
    },
    length: {
        type: String,
        trim: true,
        default: '6.3 meters',
    },
    blouseLength: {
        type: String,
        trim: true,
        default: '0.8 meters (included)',
    },
    origin: {
        type: String,
        trim: true,
        default: 'India',
    },
    shortIntro: {
        type: String,
        trim: true,
        default: '',
    },
    styleTip: {
        type: String,
        trim: true,
        default: '',
    },
    careInstructions: {
        type: String,
        trim: true,
        default: '',
    },
    shippingInfo: {
        type: String,
        trim: true,
        default: '',
    },
    fabricDetails: {
        type: String,
        trim: true,
        default: '',
    },
}, { timestamps: true });

// ─── Performance Indexes ────────────────────────────────────────────────────
// Compound index for the most common listing query (active products, sorted by new)
productSchema.index({ isActive: 1, createdAt: -1 });
// Category + price filter scenario
productSchema.index({ category: 1, isActive: 1, price: 1 });
// WeaveType filter
productSchema.index({ weaveType: 1, isActive: 1 });
// Multikey indexes for array fields used in $in filters
productSchema.index({ tags: 1 });
productSchema.index({ occasions: 1 });
productSchema.index({ collections: 1 });
// Text search on name + description
productSchema.index({ name: 'text', description: 'text' });

// Auto-disable product when stock = 0
productSchema.pre('save', function () {
    if (this.stock <= 0) {
        this.isActive = false;
    }
});

module.exports = mongoose.model('Product', productSchema);
