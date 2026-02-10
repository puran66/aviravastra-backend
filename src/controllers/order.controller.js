const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { updateStock } = require('../utils/stock');
const { sendWhatsAppNotification } = require('../utils/whatsapp');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

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
        // Sync phone if not present
        if (!customer.phone && phone) {
            customer.phone = phone;
            await customer.save();
        }
    } else {
        // Try to find by unique email first
        customer = await Customer.findOne({ email });

        if (!customer && phone) {
            // Try by phone as backup
            customer = await Customer.findOne({ phone });
        }

        if (!customer) {
            // Create new guest/customer record
            customer = await Customer.create({
                phone,
                name: customerName,
                email
            });
        } else {
            // Update phone if missing in existing record
            if (!customer.phone && phone) {
                customer.phone = phone;
                await customer.save();
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
            amount: totalAmount * 100, // amount in the smallest currency unit (ps)
            currency: "INR",
            receipt: orderId,
        };

        try {
            const razorpayOrder = await razorpay.orders.create(options);
            orderData.razorpayOrderId = razorpayOrder.id;
        } catch (error) {
            // Rollback stock reservation on payment gateway failure
            await updateStock(items, 'INCREASE');
            res.status(500);
            throw new Error('Razorpay Order Creation Failed');
        }
    }

    const order = await Order.create(orderData);

    // 4. Send Notifications for COD (Online notification happens after payment verification)
    if (paymentMethod === 'COD') {
        await sendWhatsAppNotification(order);
    }

    res.status(201).json(order);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Admin or Owner)
const getOrderById = async (req, res) => {
    let order;

    // Try finding by internal ID first if it looks like a MongoDB ID
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findById(req.params.id).populate('customer', 'name phone email');
    }

    // If not found or not a MongoDB ID, try human-friendly orderId
    if (!order) {
        order = await Order.findOne({ orderId: req.params.id }).populate('customer', 'name phone email');
    }

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check Authorization: Admin can see anything, Customer can only see their own
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

    // Capture previous status to check if we need to restore stock
    const previousStatus = order.orderStatus;

    order.orderStatus = status;
    const updatedOrder = await order.save();

    // If order is cancelled now (and wasn't before), restore stock
    if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
        await updateStock(order.items, 'INCREASE');
    }

    // If order was cancelled and is now moved back to a valid state, reduce stock again
    // (Optional but good for administrative edge cases)
    if (previousStatus === 'CANCELLED' && status !== 'CANCELLED') {
        const stockResumed = await updateStock(order.items, 'DECREASE');
        if (!stockResumed) {
            // Revert status if stock not available
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
        .populate('items.product', 'name images');

    if (!order) {
        res.status(404);
        throw new Error('Order not found with provided details');
    }

    // Return only non-sensitive "Tracking" data
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

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({}).sort('-createdAt');
    res.json(orders);
};

// @desc    Cancel order (User cancelled payment)
// @route   POST /api/orders/:id/cancel
// @access  Public
const cancelOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Only allow cancelling if order is awaiting payment
    if (order.orderStatus === 'AWAITING_PAYMENT' || order.paymentStatus === 'PENDING') {
        // Atomic update to avoid race conditions
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
    const orders = await Order.find({ customer: req.customer._id }).sort('-createdAt');
    res.json(orders);
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

    // 1. Eligibility Check
    if (order.paymentStatus === 'PAID') {
        return res.status(400).json({ message: 'Order is already paid' });
    }

    if (order.orderStatus === 'CANCELLED') {
        return res.status(400).json({ message: 'Cannot retry payment for a cancelled order' });
    }

    // Ensure it's an online payment
    if (order.paymentMethod !== 'ONLINE') {
        return res.status(400).json({ message: 'Retry only available for online payments' });
    }

    // 2. Re-create Razorpay Order
    const options = {
        amount: order.totalAmount * 100,
        currency: "INR",
        receipt: order.orderId,
    };

    try {
        const razorpayOrder = await razorpay.orders.create(options);

        // 3. Update existing order with new Razorpay ID and reset status
        order.razorpayOrderId = razorpayOrder.id;
        order.paymentStatus = 'PENDING';
        order.orderStatus = 'AWAITING_PAYMENT';

        await order.save();

        console.log(`[Payment Retry] New Razorpay Order ${razorpayOrder.id} created for Order ${order.orderId}`);

        res.json(order);
    } catch (error) {
        console.error('[Payment Retry Error]', error.message);
        res.status(500);
        throw new Error('Failed to initiate payment retry');
    }
};


// @desc    Cleanup expired "AWAITING_PAYMENT" orders and restore stock
// This prevents stock from being permanently reserved if user abandons payment
const cleanupExpiredOrders = async () => {
    try {
        const expiryTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

        const expiredOrders = await Order.find({
            orderStatus: 'AWAITING_PAYMENT',
            paymentStatus: 'PENDING',
            createdAt: { $lt: expiryTime }
        });

        if (expiredOrders.length === 0) return;

        console.log(`[Order Cleanup] Found ${expiredOrders.length} expired orders. Processing...`);

        for (const order of expiredOrders) {
            // Atomic check to ensure we don't cancel if payment just arrived
            const updatedOrder = await Order.findOneAndUpdate(
                { _id: order._id, orderStatus: 'AWAITING_PAYMENT' },
                { orderStatus: 'CANCELLED', paymentStatus: 'FAILED' },
                { new: true }
            );

            if (updatedOrder) {
                await updateStock(order.items, 'INCREASE');
                console.log(`[Cleanup] Cancelled Order ${order.orderId} and restored stock.`);
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





