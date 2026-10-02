const express = require('express');
const { toggleFavorite, getFavorites } = require('../controllers/favorite.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // All favorites routes require authentication

router.post('/:propertyId', toggleFavorite);
router.get('/', getFavorites);

module.exports = router;
