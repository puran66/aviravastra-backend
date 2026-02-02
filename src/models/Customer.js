const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null/missing values
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        trim: true,
        sparse: true
    },
    avatar: {
        type: String,
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
