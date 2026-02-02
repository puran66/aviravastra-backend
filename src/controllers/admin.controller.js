const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
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
    const admin = await Admin.findById(req.admin._id);

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

// @desc    Get all customers with order summary
// @route   GET /api/admin/customers
// @access  Private/Admin
const getCustomers = async (req, res) => {
    const customers = await Customer.find({}).sort('-createdAt');

    const customersWithOrders = await Promise.all(customers.map(async (cust) => {
        const orderCount = await Order.countDocuments({ customer: cust._id });
        const lastOrder = await Order.findOne({ customer: cust._id }).sort('-createdAt');

        return {
            ...cust.toObject(),
            totalOrders: orderCount,
            lastOrderDate: lastOrder ? lastOrder.createdAt : null
        };
    }));

    res.json(customersWithOrders);
};

module.exports = {
    loginAdmin,
    getAdminProfile,
    getCustomers,
};

