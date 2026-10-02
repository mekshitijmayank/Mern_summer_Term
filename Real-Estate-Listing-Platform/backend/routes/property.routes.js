const express = require('express');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty
} = require('../controllers/property.controller');

const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router
  .route('/')
  .get(getProperties)
  .post(protect, authorize('agent', 'admin'), upload.fields([{ name: 'images', maxCount: 10 }, { name: 'brochure', maxCount: 1 }]), createProperty);

router
  .route('/:id')
  .get(getProperty)
  .put(protect, authorize('agent', 'admin'), upload.fields([{ name: 'images', maxCount: 10 }, { name: 'brochure', maxCount: 1 }]), updateProperty)
  .delete(protect, authorize('agent', 'admin'), deleteProperty);

module.exports = router;
