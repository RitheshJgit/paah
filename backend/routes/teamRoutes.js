import express from 'express';
import { createTeam, joinTeam, getTeams } from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';
import { updateTeamName } from '../controllers/teamController.js';
import { getMyTeam, changeLeader, leaveTeam } from '../controllers/teamController.js';




const router = express.Router();

router.post('/create', protect, createTeam);
router.post('/join', protect, joinTeam);
router.get('/', getTeams);
router.put('/:id', protect, updateTeamName);
router.get('/my', protect, getMyTeam);
router.put('/:id/leader', protect, changeLeader);
router.post('/leave', protect, leaveTeam);

export default router;