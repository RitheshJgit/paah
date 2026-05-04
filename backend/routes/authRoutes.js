import express from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  sendResetOTP,
  resetPasswordWithOTP
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// ❌ REMOVE THIS (since Firebase is removed)
// router.post('/social-login', socialLogin);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/send-otp', sendResetOTP);
router.post('/reset-password-otp', resetPasswordWithOTP);

export default router;
