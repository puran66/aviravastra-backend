const { OAuth2Client } = require('google-auth-library');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @desc    Auth with Google (Login/Register)
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleLogin = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture: avatar } = payload;

        // Find or Create Customer
        let customer = await Customer.findOne({ $or: [{ googleId }, { email }] });

        if (customer) {
            // Update googleId if it was a guest account with same email
            if (!customer.googleId) {
                customer.googleId = googleId;
            }
            // Update profile info
            customer.name = name || customer.name;
            customer.avatar = avatar || customer.avatar;
            await customer.save();
        } else {
            // New user
            customer = await Customer.create({
                googleId,
                name,
                email,
                avatar,
            });
        }

        res.json({
            _id: customer._id,
            name: customer.name,
            email: customer.email,
            avatar: customer.avatar,
            phone: customer.phone,
            address: customer.address,
            token: generateToken(customer._id),
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Invalid Google token' });
    }
};

/**
 * @desc    Get Current User Profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
    const customer = await Customer.findById(req.customer._id);

    if (customer) {
        res.json({
            _id: customer._id,
            name: customer.name,
            email: customer.email,
            avatar: customer.avatar,
            phone: customer.phone,
            address: customer.address,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

/**
 * @desc    Update User Profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
    const customer = await Customer.findById(req.customer._id);

    if (customer) {
        customer.name = req.body.name || customer.name;
        customer.phone = req.body.phone || customer.phone;

        if (req.body.address) {
            customer.address = {
                ...customer.address,
                ...req.body.address
            };
        }

        const updatedCustomer = await customer.save();

        res.json({
            _id: updatedCustomer._id,
            name: updatedCustomer.name,
            email: updatedCustomer.email,
            avatar: updatedCustomer.avatar,
            phone: updatedCustomer.phone,
            address: updatedCustomer.address,
            token: generateToken(updatedCustomer._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    googleLogin,
    getProfile,
    updateProfile,
};
