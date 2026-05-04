import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getProfile, getMe } from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', protect, getProfile);

// ✅ ADD THIS BACK
router.get('/me', protect, getMe);

export default router;