const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../config/mailer');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');

// Generate JWT token helper
const generateToken = (userId, email) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables.');
  }
  return jwt.sign(
    { id: userId, email },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Set token cookie helper
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.email);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    token,
    user: user.toPublicJSON ? user.toPublicJSON() : {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      authProvider: user.authProvider,
      createdAt: user.createdAt,
    },
  });
};

/**
 * @desc    Send 6-digit OTP to user email
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format.',
      });
    }

    // Generate secure 6-digit OTP
    const otpNumber = crypto.randomInt(100000, 999999).toString();

    // Hash the OTP with bcrypt before saving
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otpNumber, salt);

    // OTP expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Remove any previous active OTPs for this email and create new one
    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({
      email: normalizedEmail,
      otpHash,
      expiresAt,
      attempts: 0,
    });

    // Send email via Nodemailer
    let mailResult = null;
    try {
      mailResult = await sendOtpEmail(normalizedEmail, otpNumber);
    } catch (mailErr) {
      console.warn('[AuthController] Failed to send email via SMTP, continuing with preview:', mailErr.message);
    }

    console.log(`[AUTH] Generated OTP for ${normalizedEmail}: ${otpNumber} (expires at ${expiresAt.toLocaleTimeString()})`);

    // Return clean response without exposing OTP
    const responsePayload = {
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}. Please check your inbox.`,
      expiresInMinutes: 10,
    };

    return res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP and log in / register user
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and 6-digit OTP.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be a 6-digit numeric code.',
      });
    }

    // Find the latest OTP for this email
    const otpRecord = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP found or it has expired. Please request a new code.',
      });
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteMany({ email: normalizedEmail });
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    // Check maximum attempts (limit to 5)
    if (otpRecord.attempts >= 5) {
      await Otp.deleteMany({ email: normalizedEmail });
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new code.',
      });
    }

    // Compare OTP hash
    const isMatch = await bcrypt.compare(cleanOtp, otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remainingAttempts = 5 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`,
      });
    }

    // Delete OTP once verified successfully
    await Otp.deleteMany({ email: normalizedEmail });

    // Find or create User
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const defaultName = normalizedEmail.split('@')[0];
      user = await User.create({
        email: normalizedEmail,
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        authProvider: 'otp',
      });
      console.log(`[AUTH] New user registered via OTP: ${user.email}`);
    } else {
      console.log(`[AUTH] Existing user logged in via OTP: ${user.email}`);
    }

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate with Google OAuth 2.0
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleAuth = async (req, res, next) => {
  try {
    const { idToken, demoUser } = req.body;

    // Check for demo login (if Google Client ID is not configured in development or user clicks Demo Google login)
    if (demoUser && (!process.env.GOOGLE_CLIENT_ID || process.env.NODE_ENV !== 'production')) {
      const demoEmail = (demoUser.email || 'demo.google.user@taskflow.dev').toLowerCase();
      let user = await User.findOne({ email: demoEmail });
      if (!user) {
        user = await User.create({
          email: demoEmail,
          name: demoUser.name || 'Alex Google Demo',
          avatar: demoUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          authProvider: 'google',
          googleId: 'demo-google-id-' + Date.now(),
        });
      }
      return sendTokenResponse(user, 200, res);
    }

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required.',
      });
    }

    let payload = null;

    if (process.env.GOOGLE_CLIENT_ID) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (verifyErr) {
        console.error('[GoogleAuth] Token verification failed:', verifyErr.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired Google ID token.',
        });
      }
    } else {
      // Decode JWT payload without verification if client id is not yet set in dev
      try {
        const parts = idToken.split('.');
        if (parts.length === 3) {
          payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        }
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Malformed Google token.',
        });
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: 'Failed to extract email from Google credential.',
      });
    }

    const { email, name, picture, sub: googleId } = payload;
    const normalizedEmail = email.toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        avatar: picture || '',
        authProvider: 'google',
        googleId,
      });
      console.log(`[AUTH] New user registered via Google: ${user.email}`);
    } else {
      // Update Google info if not present
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
      console.log(`[AUTH] Existing user signed in via Google: ${user.email}`);
    }

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user details
 * @route   GET /api/auth/me
 * @access  Private (authMiddleware)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log user out / clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

module.exports = {
  sendOtp,
  verifyOtp,
  googleAuth,
  getMe,
  logout,
};
