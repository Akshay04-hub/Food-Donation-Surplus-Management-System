const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middleware/auth');

// Create rating
router.post('/', authMiddleware, ratingController.createRating);

// Get user ratings
router.get('/user/:userId', ratingController.getUserRatings);

// Get user average rating
router.get('/user/:userId/average', ratingController.getUserAverageRating);

// Update rating
router.put('/:id', authMiddleware, ratingController.updateRating);

module.exports = router;
