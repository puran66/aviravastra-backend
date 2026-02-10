const Customer = require('../models/Customer');
const Order = require('../models/Order');

// @desc    Get all customers with stats
// @route   GET /api/customers
// @access  Private/Admin
const getCustomers = async (req, res) => {
    try {
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: '$customer',
                    totalOrders: { $sum: 1 },
                    totalSpent: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$totalAmount', 0] }
                    },
                    lastOrderDate: { $max: '$createdAt' }
                }
            }
        ]);

        const customers = await Customer.find({}).lean();

        const customeredWithStats = customers.map(c => {
            const stat = stats.find(s => s._id?.toString() === c._id.toString());
            return {
                ...c,
                totalOrders: stat ? stat.totalOrders : 0,
                totalSpent: stat ? stat.totalSpent : 0,
                lastOrderDate: stat ? stat.lastOrderDate : null
            };
        });

        res.json(customeredWithStats);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};


// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private/Admin
const getCustomerById = async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (customer) {
        res.json(customer);
    } else {
        res.status(404);
        throw new Error('Customer not found');
    }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
const deleteCustomer = async (req, res) => {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (customer) {
        res.json({ message: 'Customer removed' });
    } else {
        res.status(404).json({ message: 'Customer not found' });
    }
};

module.exports = {
    getCustomers,
    getCustomerById,
    deleteCustomer,
};

