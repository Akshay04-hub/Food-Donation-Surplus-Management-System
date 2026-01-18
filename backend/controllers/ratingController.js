// backend/controllers/ratingController.js
const Rating = require('../models/Rating');
const User = require('../models/User');
const Donation = require('../models/Donation');
const PickupRequest = require('../models/PickupRequest');

/**
 * Create Rating
 */
exports.createRating = async (req, res) => {
  try {
    const { rated_user_id, donation_id, request_id, rating, review_text } = req.body;
    const raterId = req.user && (req.user.id || req.user._id);
    if (!raterId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Validate rating
    const r = Number(rating);
    if (!r || r < 1 || r > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Ensure rated user exists
    const ratedUser = await User.findById(rated_user_id);
    if (!ratedUser) {
      return res.status(404).json({ success: false, message: 'Rated user not found' });
    }

    // Optionally check donation/request existence when provided
    if (donation_id) {
      const donation = await Donation.findById(donation_id);
      if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    }
    if (request_id) {
      const request = await PickupRequest.findById(request_id);
      if (!request) return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    // Check if user already rated this person for the same donation/request
    const existingRating = await Rating.findOne({
      rater: raterId,
      rated_user: rated_user_id,
      $or: [
        { donation: donation_id ? donation_id : null },
        { request: request_id ? request_id : null }
      ]
    });

    if (existingRating) {
      return res.status(400).json({ success: false, message: 'You have already rated this person for this transaction' });
    }

    const newRating = new Rating({
      rater: raterId,
      rated_user: rated_user_id,
      donation: donation_id || undefined,
      request: request_id || undefined,
      rating: r,
      review_text
    });

    await newRating.save();

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      rating: newRating
    });
  } catch (error) {
    console.error('Create rating error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating rating',
      error: error.message
    });
  }
};

/**
 * Get User Ratings (list)
 */
exports.getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;

    // find ratings for the user
    const ratings = await Rating.find({ rated_user: userId })
      .populate({ path: 'rater', select: 'first_name last_name profile_image_url' })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate average rating
    let averageRating = 0;
    if (ratings.length > 0) {
      const sum = ratings.reduce((s, it) => s + (it.rating || 0), 0);
      averageRating = (sum / ratings.length).toFixed(2);
    }

    return res.json({
      success: true,
      count: ratings.length,
      averageRating,
      ratings
    });
  } catch (error) {
    console.error('Get user ratings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching ratings',
      error: error.message
    });
  }
};

/**
 * Get User Average Rating (aggregation)
 */
exports.getUserAverageRating = async (req, res) => {
  try {
    const { userId } = req.params;

    const agg = await Rating.aggregate([
      { $match: { rated_user: require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$rated_user',
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    const result = agg[0] || {};
    return res.json({
      success: true,
      averageRating: result.averageRating ? Number(result.averageRating.toFixed(2)) : 0,
      totalRatings: result.totalRatings || 0
    });
  } catch (error) {
    console.error('Get average rating error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching average rating',
      error: error.message
    });
  }
};

/**
 * Update Rating
 */
exports.updateRating = async (req, res) => {
  try {
    const { id } = req.params; // uuid in URL
    const { rating, review_text } = req.body;
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // find by uuid
    const ratingRecord = await Rating.findOne({ uuid: id });
    if (!ratingRecord) return res.status(404).json({ success: false, message: 'Rating not found' });

    // check ownership
    if (ratingRecord.rater.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this rating' });
    }

    if (rating !== undefined) {
      const r = Number(rating);
      if (!r || r < 1 || r > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
      }
      ratingRecord.rating = r;
    }

    if (review_text !== undefined) ratingRecord.review_text = review_text;

    await ratingRecord.save();

    return res.json({
      success: true,
      message: 'Rating updated',
      rating: ratingRecord
    });
  } catch (error) {
    console.error('Update rating error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating rating',
      error: error.message
    });
  }
};
