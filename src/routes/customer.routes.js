const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById, deleteCustomer } = require('../controllers/customer.controller');

const { protectAdmin } = require('../middlewares/auth.middleware');

router.route('/')
    .get(protectAdmin, getCustomers);

router.route('/:id')
    .get(protectAdmin, getCustomerById)
    .delete(protectAdmin, deleteCustomer);


module.exports = router;
