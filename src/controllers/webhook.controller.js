const crypto = require('crypto');
const Order = require('../models/Order');
const { updateStock } = require('../utils/stock');
const { sendWhatsAppNotification } = require('../utils/whatsapp');
const { sendOrderEmail } = require('../utils/email');

/**
 * @desc    Handle Razorpay Webhooks
 * @route   POST /api/webhooks/razorpay
 * @access  Public (Signature Verified)
 */
const handleRazorpayWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
        return res.status(401).json({ message: 'Missing signature' });
    }

    // Verify signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
        console.error('[Webhook Error] Invalid signature received');
        return res.status(401).json({ message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    try {
        if (event === 'payment.captured') {
            const payment = payload.payment.entity;
            const razorpayOrderId = payment.order_id;
            const razorpayPaymentId = payment.id;

            // Atomic status update for idempotency
            const order = await Order.findOneAndUpdate(
                { razorpayOrderId, paymentStatus: { $ne: 'PAID' } },
                {
                    paymentStatus: 'PAID',
                    orderStatus: 'PLACED',
                    razorpayPaymentId,
                    paidAt: new Date()
                },
                { new: true }
            );

            if (!order) {
                return res.status(200).json({ status: 'ok' });
            }

            // Note: Stock was already reduced during order creation in this system's flow.
            // We only need to ensure notifications are sent if this is the first time we mark it PAID.
            await sendWhatsAppNotification(order);
            await sendOrderEmail(order);
        }
        else if (event === 'payment.failed') {
            const payment = payload.payment.entity;
            const razorpayOrderId = payment.order_id;

            const order = await Order.findOne({ razorpayOrderId });
            if (!order || order.paymentStatus === 'PAID' || order.orderStatus === 'CANCELLED') {
                return res.status(200).json({ status: 'ok' });
            }

            // Mark as FAILED and restore stock
            const failedOrder = await Order.findOneAndUpdate(
                { _id: order._id, paymentStatus: { $ne: 'PAID' }, orderStatus: { $ne: 'CANCELLED' } },
                { paymentStatus: 'FAILED', orderStatus: 'CANCELLED' },
                { new: true }
            );

            if (failedOrder) {
                await updateStock(failedOrder.items, 'INCREASE');
                console.log(`[Webhook Fail] Order ${failedOrder.orderId} marked failed and stock restored.`);
            }
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('[Webhook Process Error]', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    handleRazorpayWebhook
};
