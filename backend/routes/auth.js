const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/user', auth, authController.getUser);
router.get('/user/:id', adminAuth, authController.getUser);
router.put('/user/:id', adminAuth, authController.updateUser);
router.put('/user/password/update', auth, authController.updatePassword);
router.delete('/user/:id', adminAuth, authController.deleteUser);
router.get('/allusers', adminAuth, authController.getAllUsers);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;    