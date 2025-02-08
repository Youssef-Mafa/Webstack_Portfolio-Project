const router = require('express').Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-otp', authController.sendVerificationOTP);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;