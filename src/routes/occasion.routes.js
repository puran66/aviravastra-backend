const express = require('express');
const router = express.Router();
const { getOccasions, createOccasion, updateOccasion, deleteOccasion } = require('../controllers/occasion.controller');
const { protectAdmin } = require('../middlewares/auth.middleware');

router.get('/', getOccasions);
router.post('/', protectAdmin, createOccasion);
router.put('/:id', protectAdmin, updateOccasion);
router.delete('/:id', protectAdmin, deleteOccasion);

module.exports = router;
