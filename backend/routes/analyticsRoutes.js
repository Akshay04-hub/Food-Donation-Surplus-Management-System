const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Get dashboard statistics
router.get('/dashboard/stats', authMiddleware, analyticsController.getDashboardStats);

// Get analytics by date range
router.get('/date-range', authMiddleware, roleCheck('ADMIN'), analyticsController.getAnalyticsByDateRange);

// Get top donors
router.get('/top-donors', authMiddleware, roleCheck('ADMIN'), analyticsController.getTopDonors);

// Get food categories distribution
router.get('/food-distribution', authMiddleware, roleCheck('ADMIN'), analyticsController.getFoodCategoriesDistribution);

// Get city stats
router.get('/city-stats', authMiddleware, roleCheck('ADMIN'), analyticsController.getCityStats);

module.exports = router;
