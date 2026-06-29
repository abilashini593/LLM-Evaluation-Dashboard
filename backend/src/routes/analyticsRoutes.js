import express from 'express';
import { getLeaderboard, getChartsData } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all analytics routes

router.get('/leaderboard', getLeaderboard);
router.get('/charts', getChartsData);

export default router;
