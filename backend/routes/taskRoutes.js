import express from 'express';
import {
  createTask,
  joinTask,
  getTasks,
  acceptTask,
  verifyTask,
  submitTaskProof,
  getMyPendingTasks,
  getPendingTasks,
  getAllTaskSubmissions,
  getMyTasks,
  completeTask
} from '../controllers/taskController.js';

import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/create', protect, adminOnly, createTask);
router.post('/join', protect, joinTask);



router.get('/my', protect, getMyTasks);   // ✅ THIS FIXES YOUR ERROR
router.get('/', protect, getTasks);

router.post('/accept', protect, acceptTask);

router.post(
  '/submit-proof',
  protect,
  upload.single('proof'),
  submitTaskProof
);

router.post('/verify', protect, adminOnly, verifyTask);

// ✅ USER BADGE COUNT
router.get('/my/pending-count', protect, getMyPendingTasks);

// 🔥 ADMIN FETCH ALL PENDING
router.get('/pending', protect, adminOnly, getPendingTasks);

router.get('/all', protect, adminOnly, getAllTaskSubmissions);

router.post('/complete', protect, completeTask);

export default router;