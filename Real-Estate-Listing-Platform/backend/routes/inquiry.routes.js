const express = require('express');
const { createInquiry, getInquiries, updateInquiryStatus } = require('../controllers/inquiry.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', createInquiry);
router.get('/', protect, getInquiries);
router.patch('/:id/status', protect, authorize('agent', 'admin'), updateInquiryStatus);

module.exports = router;
