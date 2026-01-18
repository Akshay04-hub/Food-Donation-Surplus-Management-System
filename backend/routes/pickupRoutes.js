const express = require('express');
const router = express.Router();
const pickupRequestController = require('../controllers/pickupRequestController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Create pickup request (allow volunteers as well)
router.post('/', authMiddleware, roleCheck('RECEIVER', 'VERIFIED_VOLUNTEER', 'VOLUNTEER'), pickupRequestController.createPickupRequest);

// Get pickup requests
router.get('/', authMiddleware, pickupRequestController.getPickupRequests);

// Get single pickup request
router.get('/:id', authMiddleware, pickupRequestController.getPickupRequestById);

// Confirm pickup request
router.put('/:id/confirm', authMiddleware, roleCheck('DONOR'), pickupRequestController.confirmPickupRequest);

// Reject pickup request
router.put('/:id/reject', authMiddleware, roleCheck('DONOR'), pickupRequestController.rejectPickupRequest);

// Mark as picked up
router.put('/:id/pickup', authMiddleware, pickupRequestController.markAsPickedUp);

module.exports = router;
