const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { body } = require('express-validator');
const { validateInput } = require('../middleware/validation');

// Register
// Relax first_name requirement to support NGO/DONOR flows where first_name is derived
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN'])
], validateInput([
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
]), authController.register);

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], validateInput([
  body('email').isEmail(),
  body('password').notEmpty()
]), authController.login);

// Get current user
router.get('/me', authMiddleware, authController.getCurrentUser);

// Update profile
router.put('/profile', authMiddleware, authController.updateProfile);

// Forgot / Reset password
router.post('/forgot-password', [
  body('email').isEmail()
], validateInput([
  body('email').isEmail()
]), authController.forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], validateInput([
  body('token').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
]), authController.resetPassword);

// Direct update password by email (no token)
router.post('/forgot-password/update', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], validateInput([
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
]), authController.updatePasswordByEmail);

module.exports = router;
