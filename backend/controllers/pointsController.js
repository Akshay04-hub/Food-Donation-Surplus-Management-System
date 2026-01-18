const User = require('../models/User');
const { getPointsSummary, getTransactionHistory, getLeaderboard, redeemPoints } = require('../utils/pointsUtils');

/**
 * Get user's points summary
 */
exports.getUserPoints = async (req, res) => {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const pointsSummary = await getPointsSummary(userId);

    res.json({
      success: true,
      points: pointsSummary
    });
  } catch (error) {
    console.error('Get user points error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user points',
      error: error.message
    });
  }
};

/**
 * Get user's transaction history
 */
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const history = await getTransactionHistory(userId, limit, skip);

    res.json({
      success: true,
      history: history.transactions,
      pagination: {
        page: history.page,
        totalPages: history.totalPages,
        totalCount: history.totalCount,
        limit
      }
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction history',
      error: error.message
    });
  }
};

/**
 * Get leaderboard
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await getLeaderboard(limit);

    res.json({
      success: true,
      leaderboard: leaderboard.map((user, index) => ({
        rank: index + 1,
        id: user._id,
        uuid: user.uuid,
        name: `${user.first_name} ${user.last_name || ''}`.trim(),
        profile_image_url: user.profile_image_url,
        redeemable_points: user.redeemable_points,
        total_points_earned: user.total_points_earned
      }))
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
};

/**
 * Redeem points for rewards
 */
exports.redeemPointsForReward = async (req, res) => {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { points, description } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Points must be a positive number'
      });
    }

    const updatedUser = await redeemPoints(userId, points, description || 'Reward redemption');

    res.json({
      success: true,
      message: 'Points redeemed successfully',
      user: {
        redeemable_points: updatedUser.redeemable_points,
        total_points_redeemed: updatedUser.total_points_redeemed
      }
    });
  } catch (error) {
    console.error('Redeem points error:', error);

    if (error.message === 'Insufficient points to redeem') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error redeeming points',
      error: error.message
    });
  }
};

/**
 * Get points config/information
 */
exports.getPointsInfo = async (req, res) => {
  try {
    const pointsInfo = {
      rules: {
        donation: {
          action: 'Make a donation',
          points: 10,
          description: 'Earn points when you donate food'
        },
        pickup: {
          action: 'Complete a pickup',
          points: 5,
          description: 'Earn points as a volunteer when you complete a food pickup'
        },
        volunteer: {
          action: 'Volunteer activities',
          points: 3,
          description: 'Earn points for other volunteer activities'
        }
      },
      tiers: {
        bronze: { minPoints: 0, name: 'Bronze', badge: '🥉' },
        silver: { minPoints: 100, name: 'Silver', badge: '🥈' },
        gold: { minPoints: 250, name: 'Gold', badge: '🥇' },
        platinum: { minPoints: 500, name: 'Platinum', badge: '💎' }
      },
      rewards: [
        { points: 50, name: 'Small Reward', description: 'Unlock a small reward' },
        { points: 100, name: 'Medium Reward', description: 'Unlock a medium reward' },
        { points: 250, name: 'Large Reward', description: 'Unlock a large reward' },
        { points: 500, name: 'Premium Reward', description: 'Unlock a premium reward' }
      ]
    };

    res.json({
      success: true,
      points_info: pointsInfo
    });
  } catch (error) {
    console.error('Get points info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching points information',
      error: error.message
    });
  }
};
