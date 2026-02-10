const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/product.controller');
const { protectAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { productSchema } = require('../validators/product.validator');

router.route('/')
    .get(getProducts)
    .post(protectAdmin, validate(productSchema), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protectAdmin, validate(productSchema), updateProduct)
    .delete(protectAdmin, deleteProduct);


module.exports = router;
