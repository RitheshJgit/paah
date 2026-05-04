import express from 'express';
import {
  createDonation,
  getMyDonations,
  verifyDonation,
  getPendingDonations,
  getAllDonations,
  getAdminStats
} from '../controllers/donationController.js';

import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

// 🔥 MUST be the Cloudinary upload file
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// 👤 USER ROUTES
router.get('/my', protect, getMyDonations);

// 🔥 CREATE DONATION (ONLY ONE ROUTE, CLEAN)
router.post(
  '/',
  protect,
  upload.single('proofImage'), // MUST MATCH FRONTEND
  createDonation
);

// 🛠 ADMIN ROUTES
router.post('/verify', protect, adminOnly, verifyDonation);
router.get('/pending', protect, adminOnly, getPendingDonations);
router.get('/all', protect, adminOnly, getAllDonations);
router.get('/admin-stats', protect, adminOnly, getAdminStats);

export default router;