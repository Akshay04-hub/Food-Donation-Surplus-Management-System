// backend/controllers/analyticsController.js
const Analytics = require('../models/Analytics');
const Donation = require('../models/Donation');
const User = require('../models/User');
const PickupRequest = require('../models/PickupRequest');
const Rating = require('../models/Rating');
const mongoose = require('mongoose');

/**
 * Helper: parse date to start of day
 */
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * GET /api/analytics/dashboard
 * Returns dashboard statistics similar to the original SQL version
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const today = startOfDay(new Date());

    // total donations
    const totalDonations = await Donation.countDocuments();

    // today donations
    const todayDonations = await Donation.countDocuments({ createdAt: { $gte: today } });

    // total pickups (PICKED_UP)
    const totalPickups = await PickupRequest.countDocuments({ status: 'PICKED_UP' });

    // total food quantity where donation status is PICKED_UP
    const qtyAgg = await Donation.aggregate([
      { $match: { status: 'PICKED_UP', quantity: { $exists: true } } },
      { $group: { _id: null, total_quantity: { $sum: "$quantity" } } }
    ]);
    const totalFoodQuantity = (qtyAgg[0] && qtyAgg[0].total_quantity) || 0;

    // unique receivers (distinct receiver in pickup requests with PICKED_UP)
    const uniqueReceiversAgg = await PickupRequest.aggregate([
      { $match: { status: 'PICKED_UP', receiver: { $exists: true } } },
      { $group: { _id: "$receiver" } },
      { $count: "unique_receivers" }
    ]);
    const peopleHelped = (uniqueReceiversAgg[0] && uniqueReceiversAgg[0].unique_receivers) || 0;

    // active donors (role field may be lowercase or uppercase — handle both)
    const activeDonors = await User.countDocuments({
      role: { $in: ['DONOR', 'donor'] },
      is_active: true
    });

    // active receivers (role RECEIVER or VERIFIED_VOLUNTEER)
    const activeReceivers = await User.countDocuments({
      role: { $in: ['RECEIVER', 'receiver', 'VERIFIED_VOLUNTEER', 'verified_volunteer'] },
      is_active: true
    });

    // average rating (all ratings)
    const ratingAgg = await Rating.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, avg_rating: { $avg: "$rating" } } }
    ]);
    const averageRating = ratingAgg[0] && ratingAgg[0].avg_rating ? Number(ratingAgg[0].avg_rating.toFixed(2)) : 0;

    return res.json({
      success: true,
      statistics: {
        totalDonations,
        todayDonations,
        totalPickups,
        totalFoodQuantityKg: totalFoodQuantity,
        peopleHelped,
        activeDonors,
        activeReceivers,
        averageRating
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

/**
 * GET /api/analytics (by date range)
 * Query params: startDate, endDate (ISO date strings)
 */
exports.getAnalyticsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};

    if (startDate && endDate) {
      match.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const analytics = await Analytics.find(match).sort({ date: 1 }).lean();

    return res.json({
      success: true,
      count: analytics.length,
      analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

/**
 * GET /api/analytics/top-donors?limit=10
 * Returns top donors by number of donations and total quantity
 */
exports.getTopDonors = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    // Aggregate donations grouped by donor
    const topDonors = await Donation.aggregate([
      { $match: { donor: { $exists: true } } },
      {
        $group: {
          _id: "$donor",
          donation_count: { $sum: 1 },
          total_quantity: { $sum: { $ifNull: ["$quantity", 0] } }
        }
      },
      { $sort: { donation_count: -1 } },
      { $limit: limit },
      // populate donor fields using $lookup
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "donor"
        }
      },
      { $unwind: { path: "$donor", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          donor: { _id: "$donor._id", first_name: "$donor.first_name", last_name: "$donor.last_name", email: "$donor.email" },
          donation_count: 1,
          total_quantity: 1
        }
      }
    ]);

    return res.json({
      success: true,
      count: topDonors.length,
      topDonors
    });
  } catch (error) {
    console.error('Get top donors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching top donors',
      error: error.message
    });
  }
};

/**
 * GET /api/analytics/food-distribution
 * Returns count and total quantity per food_category
 */
exports.getFoodCategoriesDistribution = async (req, res) => {
  try {
    const distribution = await Donation.aggregate([
      {
        $group: {
          _id: "$food_category",
          count: { $sum: 1 },
          total_quantity: { $sum: { $ifNull: ["$quantity", 0] } }
        }
      },
      { $project: { food_category: "$_id", count: 1, total_quantity: 1, _id: 0 } }
    ]);

    return res.json({
      success: true,
      distribution
    });
  } catch (error) {
    console.error('Get food distribution error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching food distribution',
      error: error.message
    });
  }
};

/**
 * GET /api/analytics/city-stats
 * Returns donation counts and totals grouped by city
 */
exports.getCityStats = async (req, res) => {
  try {
    const cityStats = await Donation.aggregate([
      {
        $group: {
          _id: "$city",
          donation_count: { $sum: 1 },
          total_quantity: { $sum: { $ifNull: ["$quantity", 0] } }
        }
      },
      { $sort: { donation_count: -1 } },
      { $project: { city: "$_id", donation_count: 1, total_quantity: 1, _id: 0 } }
    ]);

    return res.json({
      success: true,
      cityStats
    });
  } catch (error) {
    console.error('Get city stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching city statistics',
      error: error.message
    });
  }
};
