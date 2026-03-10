const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
    customerName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: String,
        price: Number,
        quantity: {
            type: Number,
            required: true,
            default: 1,
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['ONLINE'],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['PAID', 'PENDING', 'FAILED'],
        default: 'PENDING',
    },
    orderStatus: {
        type: String,
        enum: ['AWAITING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'PLACED',
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paidAt: Date,

}, { timestamps: true });

// ─── Performance Indexes ────────────────────────────────────────────────────
// Admin order list (sorted by newest)
orderSchema.index({ createdAt: -1 });
// Customer's own orders
orderSchema.index({ customer: 1, createdAt: -1 });
// Payment verification / webhook lookup
orderSchema.index({ razorpayOrderId: 1 });
// Cleanup job: finds expired AWAITING_PAYMENT orders quickly
orderSchema.index({ orderStatus: 1, paymentStatus: 1, createdAt: 1 });
// Public order tracking  (orderId is already unique; add email for combined lookup)
orderSchema.index({ orderId: 1, email: 1 });
// Admin filter by payment status
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
