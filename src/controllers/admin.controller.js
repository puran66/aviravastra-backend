const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // Run all independent aggregations in parallel
        const [
            totalOrders,
            totalCustomers,
            totalProducts,
            revenueResult,
            pendingOrders,
            recentOrders
        ] = await Promise.all([
            Order.countDocuments(),
            Customer.countDocuments(),
            Product.countDocuments(),

            // Single aggregation instead of loading all paid orders into memory
            Order.aggregate([
                { $match: { paymentStatus: 'PAID' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),

            Order.countDocuments({
                orderStatus: { $in: ['PLACED', 'AWAITING_PAYMENT'] }
            }),

            // Recent 5 orders — lean + select only what the dashboard needs
            Order.find({})
                .select('orderId customerName totalAmount orderStatus paymentStatus createdAt')
                .sort('-createdAt')
                .limit(5)
                .lean()
        ]);

        const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.json({
            stats: {
                totalOrders,
                totalCustomers,
                totalProducts,
                revenue,
                pendingOrders
            },
            recentOrders
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.comparePassword(password))) {
        res.json({
            _id: admin._id,
            email: admin.email,
            token: generateToken(admin._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
const getAdminProfile = async (req, res) => {
    const admin = await Admin.findById(req.admin._id).select('-password').lean();

    if (admin) {
        res.json({
            _id: admin._id,
            email: admin.email,
        });
    } else {
        res.status(404);
        throw new Error('Admin not found');
    }
};

// @desc    Get all customers with order summary (paginated)
// @route   GET /api/admin/customers?page=1&limit=20
// @access  Private/Admin
const getCustomers = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
        Customer.find({})
            .select('name email phone avatar createdAt')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .lean(),
        Customer.countDocuments()
    ]);

    // Single aggregation to get order counts for all customers in one query
    // instead of N+1 queries per customer
    const customerIds = customers.map(c => c._id);

    const orderStats = await Order.aggregate([
        { $match: { customer: { $in: customerIds } } },
        {
            $group: {
                _id: '$customer',
                totalOrders: { $sum: 1 },
                lastOrderDate: { $max: '$createdAt' }
            }
        }
    ]);

    // Map aggregation results by customer ID for O(1) lookup
    const statsMap = {};
    for (const stat of orderStats) {
        statsMap[stat._id.toString()] = {
            totalOrders: stat.totalOrders,
            lastOrderDate: stat.lastOrderDate
        };
    }

    const customersWithOrders = customers.map(cust => ({
        ...cust,
        totalOrders: statsMap[cust._id.toString()]?.totalOrders || 0,
        lastOrderDate: statsMap[cust._id.toString()]?.lastOrderDate || null
    }));

    res.json({
        customers: customersWithOrders,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
};

module.exports = {
    loginAdmin,
    getAdminProfile,
    getCustomers,
    getDashboardStats,
};
