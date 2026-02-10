const Product = require('../models/Product');

/**
 * Atomically updates stock for a list of items.
 * @param {Array} items - List of items with product ID and quantity
 * @param {String} type - 'DECREASE' or 'INCREASE'
 * @returns {Boolean} - True if successful, False if insufficient stock
 */
const updateStock = async (items, type = 'DECREASE') => {
    const processedItems = [];

    try {
        for (const item of items) {
            if (type === 'DECREASE') {
                const updatedProduct = await Product.findOneAndUpdate(
                    {
                        _id: item.product,
                        stock: { $gte: item.quantity },
                        isActive: true
                    },
                    {
                        $inc: { stock: -item.quantity }
                    },
                    { new: true }
                );

                if (!updatedProduct) {
                    // Rollback already processed items in this loop failure
                    for (const rollback of processedItems) {
                        await Product.findByIdAndUpdate(rollback.product, { $inc: { stock: rollback.quantity } });
                    }
                    return false;
                }
            } else {
                // INCREASE is always allowed (returns stock)
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
            }
            processedItems.push(item);
        }
        return true;
    } catch (error) {
        // Rollback on unexpected database error
        for (const rollback of processedItems) {
            await Product.findByIdAndUpdate(rollback.product, { $inc: { stock: rollback.quantity } });
        }
        throw error;
    }
};

module.exports = { updateStock };

