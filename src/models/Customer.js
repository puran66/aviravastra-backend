const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true
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
    password: {
        type: String,
        minlength: 6,
        select: false // Don't return password by default
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

// Hash password before saving
customerSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
customerSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Customer', customerSchema);
