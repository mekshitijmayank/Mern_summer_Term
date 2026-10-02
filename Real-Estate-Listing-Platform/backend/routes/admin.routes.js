const express = require('express');
const { getUsers, updateUserRole } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;