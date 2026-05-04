import express from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  sendResetOTP,
  resetPasswordWithOTP,
  socialLogin // 🔥 ADD THIS
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// 🔥 ADD THIS
router.post('/social-login', socialLogin);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/send-otp', sendResetOTP);
router.post('/reset-password-otp', resetPasswordWithOTP);

export default router;