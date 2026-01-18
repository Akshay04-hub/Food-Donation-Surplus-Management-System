const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/pointsController');
const auth = require('../middleware/auth');

/**
 * Get user's points summary and balance
 * GET /api/points/my-points
 */
router.get('/my-points', auth, pointsController.getUserPoints);

/**
 * Get user's transaction history
 * GET /api/points/history
 */
router.get('/history', auth, pointsController.getTransactionHistory);

/**
 * Get leaderboard
 * GET /api/points/leaderboard
 */
router.get('/leaderboard', pointsController.getLeaderboard);

/**
 * Get points information and rules
 * GET /api/points/info
 */
router.get('/info', pointsController.getPointsInfo);

/**
 * Redeem points for rewards
 * POST /api/points/redeem
 */
router.post('/redeem', auth, pointsController.redeemPointsForReward);

module.exports = router;
