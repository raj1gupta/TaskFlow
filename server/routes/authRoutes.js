const express = require('express');
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  googleAuth,
  getMe,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { otpRateLimiter, authLimiter } = require('../middleware/rateLimiter');
const { validateSendOtp, validateVerifyOtp } = require('../middleware/validator');

// OTP generation & delivery with rate limiting and input validation
router.post('/send-otp', otpRateLimiter, validateSendOtp, sendOtp);

// OTP validation & sign in with rate limiting and input validation
router.post('/verify-otp', authLimiter, validateVerifyOtp, verifyOtp);

// Google OAuth verification
router.post('/google', authLimiter, googleAuth);

// Get current session user
router.get('/me', protect, getMe);

// Logout
router.post('/logout', logout);

module.exports = router;
