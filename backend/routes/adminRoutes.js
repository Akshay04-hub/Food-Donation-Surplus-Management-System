const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// All admin routes require authentication
router.use(authMiddleware);

// Get all users
router.get('/users', adminController.getAllUsers);

// Get all donations
router.get('/donations', adminController.getAllDonations);

// Get all pickup requests
router.get('/pickups', adminController.getAllPickups);

// Get NGO activity breakdown
router.get('/ngos', adminController.getNGOActivity);

// Get donor activity breakdown
router.get('/donors', adminController.getDonorActivity);

// Get volunteer activity breakdown
router.get('/volunteers', adminController.getVolunteerActivity);

// Get admin statistics
router.get('/stats', adminController.getAdminStats);

// Get activity logs
router.get('/activity-logs', adminController.getActivityLogs);

// Update user status
router.patch('/users/:userId/status', adminController.updateUserStatus);

// Delete user
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;
