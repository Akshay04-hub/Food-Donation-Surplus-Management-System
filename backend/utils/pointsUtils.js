const User = require('../models/User');
const Points = require('../models/Points');

/**
 * Award points to a user for a specific action
 * @param {String} userId - User ID (MongoDB ObjectId)
 * @param {Number} points - Number of points to award
 * @param {String} transactionType - Type of transaction (DONATION, PICKUP, etc.)
 * @param {String} description - Description of the action
 * @param {Object} metadata - Additional metadata for the transaction
 * @returns {Promise<Object>} - Updated user object
 */
exports.awardPoints = async (userId, points, transactionType, description = '', metadata = {}) => {
  try {
    if (!userId || !points || points < 0) {
      throw new Error('Invalid userId or points value');
    }

    // Update user's redeemable points
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          redeemable_points: points,
          total_points_earned: points
        },
        $set: {
          points_last_updated: new Date()
        }
      },
      { new: true }
    );

    // Log the transaction
    const pointsTransaction = new Points({
      user_id: userId,
      transaction_type: transactionType,
      points: points,
      description: description,
      metadata: metadata
    });
    await pointsTransaction.save();

    return updatedUser;
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
};

/**
 * Redeem points from a user
 * @param {String} userId - User ID (MongoDB ObjectId)
 * @param {Number} points - Number of points to redeem
 * @param {String} description - Description of redemption
 * @returns {Promise<Object>} - Updated user object
 */
exports.redeemPoints = async (userId, points, description = '') => {
  try {
    if (!userId || !points || points < 0) {
      throw new Error('Invalid userId or points value');
    }

    // Check if user has enough points
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.redeemable_points < points) {
      throw new Error('Insufficient points to redeem');
    }

    // Update user's redeemable points
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          redeemable_points: -points,
          total_points_redeemed: points
        },
        $set: {
          points_last_updated: new Date()
        }
      },
      { new: true }
    );

    // Log the transaction
    const pointsTransaction = new Points({
      user_id: userId,
      transaction_type: 'REDEMPTION',
      points: -points,
      description: description
    });
    await pointsTransaction.save();

    return updatedUser;
  } catch (error) {
    console.error('Error redeeming points:', error);
    throw error;
  }
};

/**
 * Get user points summary
 * @param {String} userId - User ID (MongoDB ObjectId)
 * @returns {Promise<Object>} - Points summary
 */
exports.getPointsSummary = async (userId) => {
  try {
    const user = await User.findById(userId).select(
      'redeemable_points total_points_earned total_points_redeemed points_last_updated'
    );

    if (!user) {
      throw new Error('User not found');
    }

    return {
      redeemable_points: user.redeemable_points,
      total_earned: user.total_points_earned,
      total_redeemed: user.total_points_redeemed,
      last_updated: user.points_last_updated
    };
  } catch (error) {
    console.error('Error getting points summary:', error);
    throw error;
  }
};

/**
 * Get user transaction history
 * @param {String} userId - User ID (MongoDB ObjectId)
 * @param {Number} limit - Number of records to return (default: 20)
 * @param {Number} skip - Number of records to skip (for pagination)
 * @returns {Promise<Array>} - Array of transactions
 */
exports.getTransactionHistory = async (userId, limit = 20, skip = 0) => {
  try {
    const transactions = await Points.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('related_donation_id', 'food_type quantity')
      .populate('related_pickup_request_id', 'status');

    const totalCount = await Points.countDocuments({ user_id: userId });

    return {
      transactions,
      totalCount,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(totalCount / limit)
    };
  } catch (error) {
    console.error('Error getting transaction history:', error);
    throw error;
  }
};

/**
 * Get leaderboard of top users by points
 * @param {Number} limit - Number of top users to return (default: 10)
 * @returns {Promise<Array>} - Array of top users with their points
 */
exports.getLeaderboard = async (limit = 10) => {
  try {
    const leaderboard = await User.find({ redeemable_points: { $gt: 0 } })
      .select('first_name last_name redeemable_points total_points_earned profile_image_url')
      .sort({ redeemable_points: -1 })
      .limit(limit);

    return leaderboard;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

/**
 * Reverse points (for refunds/cancellations)
 * @param {String} transactionId - Points transaction ID
 * @param {String} reason - Reason for reversal
 * @returns {Promise<Object>} - Reversed transaction
 */
exports.reversePoints = async (transactionId, reason = '') => {
  try {
    const transaction = await Points.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.is_reversed) {
      throw new Error('Transaction already reversed');
    }

    // Update user points
    const user = await User.findById(transaction.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    // Reverse the points based on transaction type
    if (transaction.transaction_type === 'REDEMPTION') {
      // Add back redeemed points
      user.redeemable_points += Math.abs(transaction.points);
      user.total_points_redeemed -= Math.abs(transaction.points);
    } else {
      // Remove awarded points
      user.redeemable_points -= transaction.points;
      user.total_points_earned -= transaction.points;
    }

    await user.save();

    // Mark transaction as reversed
    transaction.is_reversed = true;
    transaction.reversal_reason = reason;
    transaction.reversed_at = new Date();
    await transaction.save();

    return transaction;
  } catch (error) {
    console.error('Error reversing points:', error);
    throw error;
  }
};

/**
 * Constants for points awards
 */
exports.POINTS_CONFIG = {
  DONATION: 10,           // Points for making a donation
  PICKUP: 5,              // Points for completing a volunteer pickup
  VOLUNTEER_ACTIVITY: 3,  // Points for other volunteer activities
  BONUS: 0                // Bonus points (manually awarded)
};
