const { OAuth2Client } = require('google-auth-library');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

// Lazy initialization of Google client to ensure process.env is loaded
let _googleClient;
const getGoogleClient = () => {
    if (!_googleClient) {
        _googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }
    return _googleClient;
};

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @desc    Register a new customer
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        const customerExists = await Customer.findOne({ email });

        if (customerExists) {
            return res.status(400).json({ message: 'Customer already exists' });
        }

        const customer = await Customer.create({
            name,
            email,
            password,
            phone
        });

        if (customer) {
            res.status(201).json({
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                token: generateToken(customer._id),
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

/**
 * @desc    Auth customer & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const customer = await Customer.findOne({ email }).select('+password');

        if (customer && (await customer.comparePassword(password))) {
            res.json({
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                avatar: customer.avatar,
                token: generateToken(customer._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

/**
 * @desc    Auth with Google (Login/Register)
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleLogin = async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ message: 'Credential is required' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;

    // Server-side logging for debugging
    console.log('🔍 Google Login Attempt...');
    console.log('🔑 Server Google Client ID:', clientId ? '✅ LOADED' : '❌ NOT FOUND');

    try {
        // Verify Google Token with trimmed credential
        const ticket = await getGoogleClient().verifyIdToken({
            idToken: credential.trim(),
            audience: clientId,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture: avatar } = payload;

        console.log('✅ Token Verified for:', email);

        // Find or Create Customer
        let customer = await Customer.findOne({ $or: [{ googleId }, { email }] });

        if (customer) {
            if (!customer.googleId) customer.googleId = googleId;
            customer.name = name || customer.name;
            customer.avatar = avatar || customer.avatar;
            await customer.save();
        } else {
            customer = await Customer.create({ googleId, name, email, avatar });
            console.log('🆕 New Customer Created:', email);
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
        console.error('🛑 Verification Failed:', error.message);
        res.status(401).json({
            message: 'Invalid Google token',
            debug: {
                error: error.message,
                clientIdLoaded: !!clientId
            }
        });
    }
};

/**
 * @desc    Get Current User Profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
    // req.customer comes from protectCustomer middleware
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
    try {
        const customer = await Customer.findById(req.customer._id);

        if (!customer) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if phone number is already taken by another user
        if (req.body.phone && req.body.phone !== customer.phone) {
            const phoneExists = await Customer.findOne({
                phone: req.body.phone,
                _id: { $ne: customer._id }
            });

            if (phoneExists) {
                return res.status(400).json({ message: 'This phone number is already linked to another account' });
            }
        }

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
    } catch (error) {
        console.error('🛑 Update Profile Error:', error.message);
        res.status(500).json({ message: 'Failed to update profile. Please try again later.' });
    }
};

module.exports = {
    register,
    login,
    googleLogin,
    getProfile,
    updateProfile,
};
