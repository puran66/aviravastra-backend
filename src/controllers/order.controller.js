const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { updateStock } = require('../utils/stock');
const { sendWhatsAppNotification } = require('../utils/whatsapp');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

// ─── Field projections ──────────────────────────────────────────────────────
// Admin/owner full view — exclude Razorpay signature (sensitive) from lean reads
const ORDER_DETAIL_PROJECTION = '-razorpaySignature -__v';
// Admin list view — lighter payload, no nested populate
const ORDER_LIST_PROJECTION = 'orderId customerName phone email totalAmount paymentMethod paymentStatus orderStatus createdAt';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
    const {
        items,
        shippingAddress,
        paymentMethod,
        totalAmount,
        phone,
        customerName,
        email
    } = req.body;

    // 0. Atomic Stock Reservation (Zero Inventory Mismatch Protection)
    const isStockReserved = await updateStock(items, 'DECREASE');
    if (!isStockReserved) {
        res.status(409);
        throw new Error('Insufficient stock');
    }

    // 1. Manage/Create Customer
    let customer;

    if (req.customer) {
        customer = req.customer;
        if (!customer.phone && phone) {
            customer.phone = phone;
            await customer.save();
        }
    } else {
        customer = await Customer.findOne({ email }).lean();

        if (!customer && phone) {
            customer = await Customer.findOne({ phone }).lean();
        }

        if (!customer) {
            customer = await Customer.create({ phone, name: customerName, email });
        } else {
            if (!customer.phone && phone) {
                await Customer.updateOne({ _id: customer._id }, { phone });
            }
        }
    }

    // 2. Prepare Order Data
    const orderId = `AVIRA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const orderData = {
        orderId,
        customer: customer._id,
        customerName,
        phone,
        email,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        items,
        totalAmount,
        paymentMethod,
        paymentStatus: 'PENDING',
        orderStatus: paymentMethod === 'ONLINE' ? 'AWAITING_PAYMENT' : 'PLACED'
    };

    // 3. Handle Razorpay Order Creation if ONLINE
    if (paymentMethod === 'ONLINE') {
        const options = {
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: orderId,
        };

        try {
            const razorpayOrder = await razorpay.orders.create(options);
            orderData.razorpayOrderId = razorpayOrder.id;
        } catch (error) {
            await updateStock(items, 'INCREASE');
            res.status(500);
            throw new Error('Razorpay Order Creation Failed');
        }
    }

    const order = await Order.create(orderData);

    // 4. Non-blocking notification for COD (fire-and-forget)
    if (paymentMethod === 'COD') {
        sendWhatsAppNotification(order).catch(() => { });  // Non-blocking: never delay response
    }

    res.status(201).json(order);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Admin or Owner)
const getOrderById = async (req, res) => {
    let order;
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
        ? { _id: req.params.id }
        : { orderId: req.params.id };

    order = await Order.findOne(query)
        .select(ORDER_DETAIL_PROJECTION)
        .populate('customer', 'name phone email')
        .populate('items.product', 'images name')
        .lean();

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const isOwner = req.customer && order.customer && order.customer._id.toString() === req.customer._id.toString();
    const isAdmin = req.admin;

    if (!isAdmin && !isOwner) {
        res.status(403);
        throw new Error('Not authorized to view this order');
    }

    res.json(order);
};


// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status;
    const updatedOrder = await order.save();

    if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
        await updateStock(order.items, 'INCREASE');
    }

    if (previousStatus === 'CANCELLED' && status !== 'CANCELLED') {
        const stockResumed = await updateStock(order.items, 'DECREASE');
        if (!stockResumed) {
            order.orderStatus = 'CANCELLED';
            await order.save();
            res.status(409);
            throw new Error('Cannot resume order: Insufficient stock');
        }
    }

    res.json(updatedOrder);
};


// @desc    Track order publicly
// @route   GET /api/orders/track
// @access  Public
const trackOrder = async (req, res) => {
    const { orderId, email } = req.query;

    if (!orderId || !email) {
        res.status(400);
        throw new Error('Order ID and Email are required');
    }

    const order = await Order.findOne({ orderId, email })
        .select('orderId orderStatus paymentStatus customerName phone createdAt totalAmount items')
        .populate('items.product', 'name images')
        .lean();

    if (!order) {
        res.status(404);
        throw new Error('Order not found with provided details');
    }

    res.json({
        _id: order._id,
        orderId: order.orderId,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        customerName: order.customerName,
        phone: order.phone,
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
        items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        }))
    });
};

// @desc    Get all orders (admin, paginated)
// @route   GET /api/orders?page=1&limit=20
// @access  Private/Admin
const getOrders = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // Optional status filter
    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .select(ORDER_LIST_PROJECTION)
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .lean(),
        Order.countDocuments(filter)
    ]);

    res.json({
        orders,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
};

// @desc    Cancel order (User cancelled payment)
// @route   POST /api/orders/:id/cancel
// @access  Public
const cancelOrder = async (req, res) => {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.orderStatus === 'AWAITING_PAYMENT' || order.paymentStatus === 'PENDING') {
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: order._id, orderStatus: { $ne: 'CANCELLED' } },
            { orderStatus: 'CANCELLED', paymentStatus: 'FAILED' },
            { new: true }
        );

        if (updatedOrder) {
            await updateStock(order.items, 'INCREASE');
            return res.json({ message: 'Order cancelled and stock restored' });
        }
    }

    res.status(400).json({ message: 'Order cannot be cancelled in current state' });
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        Order.find({ customer: req.customer._id })
            .select('orderId orderStatus paymentStatus totalAmount createdAt items')
            .populate('items.product', 'images name')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .lean(),
        Order.countDocuments({ customer: req.customer._id })
    ]);

    res.json({
        orders,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
};

// @desc    Retry payment for a failed order
// @route   POST /api/orders/:id/retry-payment
// @access  Public
const retryPayment = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.paymentStatus === 'PAID') {
        return res.status(400).json({ message: 'Order is already paid' });
    }

    if (order.orderStatus === 'CANCELLED') {
        return res.status(400).json({ message: 'Cannot retry payment for a cancelled order' });
    }

    if (order.paymentMethod !== 'ONLINE') {
        return res.status(400).json({ message: 'Retry only available for online payments' });
    }

    const options = {
        amount: order.totalAmount * 100,
        currency: 'INR',
        receipt: order.orderId,
    };

    try {
        const razorpayOrder = await razorpay.orders.create(options);

        order.razorpayOrderId = razorpayOrder.id;
        order.paymentStatus = 'PENDING';
        order.orderStatus = 'AWAITING_PAYMENT';

        await order.save();

        res.json(order);
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('[Payment Retry Error]', error.message);
        }
        res.status(500);
        throw new Error('Failed to initiate payment retry');
    }
};


// @desc    Cleanup expired "AWAITING_PAYMENT" orders and restore stock
// Runs every 15 minutes from server.js
const cleanupExpiredOrders = async () => {
    try {
        const expiryTime = new Date(Date.now() - 30 * 60 * 1000);

        // Uses compound index: { orderStatus, paymentStatus, createdAt }
        const expiredOrders = await Order.find({
            orderStatus: 'AWAITING_PAYMENT',
            paymentStatus: 'PENDING',
            createdAt: { $lt: expiryTime }
        }).select('_id items orderId').lean();

        if (expiredOrders.length === 0) return;

        for (const order of expiredOrders) {
            const updatedOrder = await Order.findOneAndUpdate(
                { _id: order._id, orderStatus: 'AWAITING_PAYMENT' },
                { orderStatus: 'CANCELLED', paymentStatus: 'FAILED' },
                { new: true }
            );

            if (updatedOrder) {
                await updateStock(order.items, 'INCREASE');
            }
        }
    } catch (err) {
        console.error('[Cleanup Error]', err.message);
    }
};

module.exports = {
    createOrder,
    getOrderById,
    updateOrderStatus,
    getOrders,
    cancelOrder,
    trackOrder,
    getMyOrders,
    retryPayment,
    cleanupExpiredOrders
};
