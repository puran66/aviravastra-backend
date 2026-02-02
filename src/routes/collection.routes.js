const express = require('express');
const router = express.Router();
const { getCollections, createCollection, updateCollection, deleteCollection } = require('../controllers/collection.controller');
const { protectAdmin } = require('../middlewares/auth.middleware');

router.get('/', getCollections);
router.post('/', protectAdmin, createCollection);
router.put('/:id', protectAdmin, updateCollection);
router.delete('/:id', protectAdmin, deleteCollection);

module.exports = router;
