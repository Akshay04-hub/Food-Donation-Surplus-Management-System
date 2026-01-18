const sendEmail = async (email, subject, message) => {
  try {
    const { sendEmail: emailSender } = require('../config/email');
    return await emailSender({
      email,
      subject,
      message
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

const generateEmailTemplate = (type, data) => {
  const templates = {
    welcome: `
      <h2>Welcome to Food Donation System</h2>
      <p>Hi ${data.name},</p>
      <p>Thank you for joining our platform. Together we can reduce food waste and help those in need.</p>
      <p>Get started by creating your first donation or browse available donations.</p>
    `,
    donation_available: `
      <h2>New Food Donation Available</h2>
      <p>Hi ${data.receiver_name},</p>
      <p>A new donation is available in your area!</p>
      <p><strong>Food Type:</strong> ${data.food_type}</p>
      <p><strong>Quantity:</strong> ${data.quantity} ${data.unit}</p>
      <p><strong>Location:</strong> ${data.location}</p>
      <p>Check the app to request this donation.</p>
    `,
    pickup_confirmed: `
      <h2>Pickup Confirmed</h2>
      <p>Hi ${data.name},</p>
      <p>Your pickup request has been confirmed!</p>
      <p><strong>Pickup Date:</strong> ${data.pickup_date}</p>
      <p><strong>Pickup Time:</strong> ${data.pickup_time}</p>
      <p><strong>Contact Person:</strong> ${data.contact_name}</p>
      <p><strong>Contact Phone:</strong> ${data.contact_phone}</p>
    `,
    organization_approved: `
      <h2>Organization Approved</h2>
      <p>Hi ${data.org_name},</p>
      <p>Congratulations! Your organization has been verified and approved.</p>
      <p>You can now receive food donations and help the community.</p>
    `,
    password_reset: `
      <h2>Password Reset Request</h2>
      <p>Hi ${data.name},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one.</p>
      <p><a href="${data.resetUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${data.resetUrl}</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    `
  };

  return templates[type] || '';
};

module.exports = { sendEmail, generateEmailTemplate };
