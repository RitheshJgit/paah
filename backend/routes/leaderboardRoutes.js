import express from 'express';
import {
  getIndividualLeaderboard,
  getTeamLeaderboard,
  getMonthlyLeaderboard,
  getSmartTeamLeaderboard,
  getSmartUserLeaderboard,
  getPlatformStats
} from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/individual', getIndividualLeaderboard);
router.get('/teams', getTeamLeaderboard);
router.get('/monthly', getMonthlyLeaderboard);
router.get('/smart-users', getSmartUserLeaderboard);
router.get('/smart-teams', getSmartTeamLeaderboard);
router.get('/stats', getPlatformStats);

export default router;