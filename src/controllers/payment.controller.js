const Order = require('../models/Order');
const { updateStock } = require('../utils/stock');
const { sendWhatsAppNotification } = require('../utils/whatsapp');
const { sendOrderEmail } = require('../utils/email');
const crypto = require('crypto');

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Public
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // 1. Idempotency Check: Avoid processing if already paid
    if (order.paymentStatus === 'PAID') {
        return res.json({ success: true, message: 'Payment already verified' });
    }

    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

    if (generated_signature === razorpay_signature) {
        // 2. Atomic Status Update: Ensure we only mark as PAID if it's currently PENDING/FAILED
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: order._id, paymentStatus: { $ne: 'PAID' } },
            {
                paymentStatus: 'PAID',
                orderStatus: 'PLACED',
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.json({ success: true, message: 'Payment already verified' });
        }

        // 3. Notify admin and customer (Only happens once due to atomic check above)
        await sendWhatsAppNotification(updatedOrder);
        await sendOrderEmail(updatedOrder);

        res.json({ success: true, message: 'Payment verified successfully' });
    } else {
        // 4. Mark as FAILED and CANCELLED, then restore stock
        const failedOrder = await Order.findOneAndUpdate(
            { _id: order._id, paymentStatus: { $ne: 'PAID' } },
            { paymentStatus: 'FAILED', orderStatus: 'CANCELLED' },
            { new: true }
        );

        if (failedOrder) {
            await updateStock(failedOrder.items, 'INCREASE');
        }

        res.status(400).json({ success: false, message: 'Invalid signature' });
    }
};

module.exports = {
    verifyPayment,
};
