const crypto = require('crypto');
const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');
const { sendEmail, generateEmailTemplate } = require('../utils/emailUtils');

// Register User
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone, role, city, state, donor_type, ngo_name, ngo_address,
            hostel_name, owner_name, restaurant_name, address } = req.body;

    // Validate input - Email is always required
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const normalizedPhone = (phone || '').replace(/\D/g, '');
    if (!normalizedPhone || normalizedPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists (Mongoose)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user (Mongoose) - ensure only valid fields
    const userData = {
      email: email.toLowerCase().trim(),
      phone: normalizedPhone,
      password_hash,
      is_verified: false
    };

    // Add first_name and last_name (required for VOLUNTEER, ADMIN; optional for DONOR, NGO)
    if (first_name && first_name.trim()) {
      userData.first_name = first_name.trim();
    } else if (role !== 'DONOR' && role !== 'NGO') {
      // first_name is required for non-DONOR, non-NGO roles
      return res.status(400).json({
        success: false,
        message: 'First name is required'
      });
    } else {
      // For DONOR and NGO, generate a default first_name if not provided
      userData.first_name = (role === 'DONOR' && owner_name) ? owner_name.split(' ')[0] : 
                            (role === 'NGO' && ngo_name) ? ngo_name.split(' ')[0] : 'User';
    }

    // Add optional fields if provided
    if (last_name && last_name.trim()) {
      userData.last_name = last_name.trim();
    } else if (role === 'DONOR' && owner_name && owner_name.trim()) {
      // For DONOR, use owner_name for last_name if available
      const parts = owner_name.trim().split(' ');
      if (parts.length > 1) {
        userData.last_name = parts.slice(1).join(' ');
      }
    }
    if (role && ['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN'].includes(role)) {
      userData.role = role;
    }
    if (role === 'DONOR' && donor_type && ['HOME', 'HOSTELS', 'RESTAURANTS'].includes(donor_type)) {
      userData.donor_type = donor_type;
      
      // Add donor type-specific fields
      if (donor_type === 'HOSTELS') {
        if (hostel_name) userData.hostel_name = hostel_name.trim();
        if (owner_name) userData.owner_name = owner_name.trim();
      } else if (donor_type === 'RESTAURANTS') {
        if (restaurant_name) userData.restaurant_name = restaurant_name.trim();
        if (owner_name) userData.owner_name = owner_name.trim();
      } else if (donor_type === 'HOME') {
        if (owner_name) userData.owner_name = owner_name.trim();
      }
      
      // Add common address field for all donor types
      if (address) userData.address = address.trim();
    }
    if (city && city.trim()) {
      userData.city = city.trim();
    }
    if (state && state.trim()) {
      userData.state = state.trim();
    }
    if (ngo_name && ngo_name.trim()) {
      userData.ngo_name = ngo_name.trim();
    }
    if (ngo_address && ngo_address.trim()) {
      userData.ngo_address = ngo_address.trim();
    }

    const user = new User(userData);
    await user.save();

    // Auto-create Organization entry for NGO users
    if (user.role === 'NGO' && ngo_name) {
      try {
        const Organization = require('../models/Organization');
        const org = new Organization({
          name: ngo_name.trim(),
          organization_type: 'NGO',
          address: ngo_address || '',
          city: city || '',
          state: state || '',
          email: user.email,
          phone: user.phone || '',
          created_by: user._id,
          verification_status: 'PENDING',
          is_active: true
        });
        await org.save();
        console.log('Organization created for NGO user:', org.name);
      } catch (orgErr) {
        console.error('Failed to create organization for NGO (non-fatal):', orgErr);
      }
    }

    // Generate token
    const token = generateToken(user);

    // Send welcome email (non-blocking)
    sendEmail(
      user.email,
      'Welcome to Food Donation System',
      generateEmailTemplate('welcome', { name: first_name })
    ).catch(err => console.error('Email error (welcome):', err));

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        uuid: user.uuid,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    console.error('Registration error - Name:', error.name);
    console.error('Registration error - Message:', error.message);
    console.error('Registration error - Code:', error.code);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      console.error('Mongoose ValidationError detected');
      const messages = [];
      
      for (const field in error.errors) {
        const fieldError = error.errors[field];
        console.error(`Field: ${field}`, fieldError.message);
        
        if (fieldError.message) {
          messages.push(fieldError.message);
        }
      }
      
      return res.status(400).json({
        success: false,
        message: messages.length > 0 ? messages[0] : 'Validation error',
        errors: messages
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `A user with this ${field} already exists`
      });
    }
    
    console.error('Unhandled error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user: ' + error.message
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user (Mongoose)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        uuid: user.uuid,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        is_verified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId).select('-password_hash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone, address, city, state, zip_code, location_latitude, location_longitude, role } = req.body;

    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const updates = {
      first_name,
      last_name,
      phone,
      address,
      city,
      state,
      zip_code
    };

    // allow updating role if provided and valid
    if (role) {
      const allowed = ['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN'];
      if (!allowed.includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
      updates.role = role;
    }

    if (location_latitude !== undefined && location_longitude !== undefined) {
      updates.location = { type: 'Point', coordinates: [parseFloat(location_longitude), parseFloat(location_latitude)] };
      updates.location_latitude = parseFloat(location_latitude);
      updates.location_longitude = parseFloat(location_longitude);
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password_hash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Forgot Password - create reset token and send email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Do not reveal existence of user
      return res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent' });
    }

    // Generate and store hashed token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    const message = generateEmailTemplate('password_reset', {
      name: user.first_name || 'there',
      resetUrl,
    });

    await sendEmail(user.email, 'Password Reset Request', message);

    return res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Error sending reset email' });
  }
};

// Reset Password - verify token and update password
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !password || !email) {
      return res.status(400).json({ success: false, message: 'Token, email, and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password_hash = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ success: true, message: 'Password reset successful. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Error resetting password' });
  }
};

// Direct password update via email (for forgot password flow without token)
exports.updatePasswordByEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password_hash = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ success: true, message: 'Password updated successfully. You can now sign in.' });
  } catch (error) {
    console.error('Update password by email error:', error);
    return res.status(500).json({ success: false, message: 'Error updating password' });
  }
};
