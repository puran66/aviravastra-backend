const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrderById,
    updateOrderStatus,
    getOrders,
    cancelOrder,
    trackOrder,
    getMyOrders,
    retryPayment
} = require('../controllers/order.controller');


const { protectAdmin, protectAdminOrCustomer, protectCustomer } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { orderSchema, updateStatusSchema } = require('../validators/order.validator');
const { orderTrackLimiter } = require('../middlewares/rateLimiter');

router.route('/track')
    .get(orderTrackLimiter, trackOrder);


router.route('/my-orders')
    .get(protectCustomer, getMyOrders);

router.route('/')
    .post(validate(orderSchema), createOrder)
    .get(protectAdmin, getOrders);


router.route('/:id')
    .get(protectAdminOrCustomer, getOrderById);

router.route('/:id/status')
    .put(protectAdmin, validate(updateStatusSchema), updateOrderStatus);

router.post('/:id/cancel', cancelOrder);
router.post('/:id/retry-payment', retryPayment);

module.exports = router;




