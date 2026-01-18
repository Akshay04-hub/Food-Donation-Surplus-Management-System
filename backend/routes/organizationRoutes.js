const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const multer = require('multer');
const path = require('path');

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Create organization
router.post('/', authMiddleware, upload.single('document'), organizationController.createOrganization);

// Get all organizations
router.get('/', organizationController.getOrganizations);

// Get single organization
router.get('/:id', organizationController.getOrganizationById);

// Approve organization (admin only)
router.put('/:id/approve', authMiddleware, roleCheck('ADMIN'), organizationController.approveOrganization);

// Reject organization (admin only)
router.put('/:id/reject', authMiddleware, roleCheck('ADMIN'), organizationController.rejectOrganization);

// Update organization
router.put('/:id', authMiddleware, organizationController.updateOrganization);

// Rate organization
router.post('/:id/rate', authMiddleware, organizationController.rateOrganization);

module.exports = router;
