const express = require('express');
const { register, login, getMe, updateDetails, updatePassword, deleteAccount } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, upload.single('photo'), updateDetails);
router.put('/password', protect, updatePassword);
router.delete('/me', protect, deleteAccount);

module.exports = router;
