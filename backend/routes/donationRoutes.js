const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Only images are allowed');
    }
  }
});

// Create donation
router.post('/', authMiddleware, roleCheck('DONOR'), upload.single('image'), donationController.createDonation);

// Get all donations (requires auth to filter by role/ngos)
router.get('/', authMiddleware, donationController.getDonations);

// Get single donation
router.get('/:id', donationController.getDonationById);

// Update donation
router.put('/:id', authMiddleware, roleCheck('DONOR'), donationController.updateDonation);

// Cancel donation
router.delete('/:id', authMiddleware, roleCheck('DONOR'), donationController.cancelDonation);

// NGO/Volunteer accept; NGO reject
router.post('/:id/accept', authMiddleware, roleCheck('NGO', 'VOLUNTEER'), donationController.acceptDonation);
router.post('/:id/reject', authMiddleware, roleCheck('NGO'), donationController.rejectDonation);

// Donation history/activity endpoints
router.get('/history/my', authMiddleware, donationController.getMyDonationHistory);
router.get('/:donationId/history', authMiddleware, donationController.getDonationHistory);
router.get('/activity/user', authMiddleware, donationController.getUserActivity);

module.exports = router;
