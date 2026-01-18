# NGO Approval System - Implementation Guide

## Overview
The NGO Approval System has been fully implemented in your project. This guide explains how to use and manage NGO registrations and approvals through the Admin Dashboard.

## Features Implemented

### 1. **Backend API Endpoints**
- **POST** `/api/organizations/` - Register new NGO
- **GET** `/api/organizations/` - Fetch organizations (with status filtering)
- **GET** `/api/organizations/:id` - Get specific organization
- **PUT** `/api/organizations/:id/approve` - Approve NGO (Admin only)
- **PUT** `/api/organizations/:id/reject` - Reject NGO (Admin only)

### 2. **Backend Controller Methods**
Location: `backend/controllers/organizationController.js`

#### `createOrganization()`
- Creates a new NGO registration
- Sets initial status to `PENDING`
- Sends notifications to all admins
- Sends email to NGO creator

#### `approveOrganization()`
- Approves a pending NGO
- Updates verification status to `APPROVED`
- Records verified_by (admin) and verified_date
- Sends approval email to NGO
- Creates notification for NGO creator

#### `rejectOrganization()`
- Rejects a pending NGO
- Updates verification status to `REJECTED`
- Records rejection reason and date
- Sends rejection email to NGO

### 3. **Frontend Admin Dashboard Enhancements**

#### NGO Management Tab Features:
1. **Filter Buttons**
   - All NGOs - Shows all registered NGOs
   - Pending (⏳) - Shows only pending approvals
   - Approved (✓) - Shows approved NGOs

2. **Pending Alert**
   - Displays when NGOs are pending approval
   - Shows count of pending approvals
   - Highlighted with warning color

3. **Enhanced Table Display**
   - Organization Name
   - Email Address
   - Location (City, State)
   - Organization Type
   - Registration Date
   - Verification Status (with color-coded badges)
   - Action Buttons (for pending NGOs only)

4. **Action Buttons**
   - **Approve Button** (✓ Approve) - Green button to approve NGO
   - **Reject Button** (✕ Reject) - Red button to reject NGO
   - Shows "Processing..." while action is in progress
   - Only visible for pending NGOs

#### Status Badges
- **PENDING** - Yellow badge, indicates awaiting approval
- **APPROVED** - Green badge, indicates verified
- **REJECTED** - Red badge, indicates rejected

## How to Use

### As an Admin:

#### Step 1: View Pending NGO Registrations
1. Login to Admin Dashboard
2. Click on the "🏢 NGOs" tab
3. You'll see all registered NGOs with their verification status

#### Step 2: Filter Pending NGOs
1. Click the "⏳ Pending" filter button
2. Dashboard will show only NGOs awaiting approval
3. A yellow warning alert appears showing count of pending approvals

#### Step 3: Review NGO Details
The table shows:
- Organization name
- Email
- Location
- Organization type
- Registration date
- Current verification status

#### Step 4: Approve or Reject NGO
For each pending NGO:
- **To Approve:** Click the green "✓ Approve" button
  - NGO will be verified immediately
  - Status changes to APPROVED (green badge)
  - Email notification sent to NGO creator
  - Notification created in NGO's notification center

- **To Reject:** Click the red "✕ Reject" button
  - A prompt will ask for rejection reason (optional)
  - Enter reason and confirm
  - Status changes to REJECTED (red badge)
  - Email notification sent with rejection reason

#### Step 5: Monitor Approved NGOs
1. Click "✓ Approved" filter to view all verified NGOs
2. Only approved NGOs will see "✓ Verified" status with no action buttons

## Database Schema Reference

### Organization Model
```javascript
{
  name: String,
  organization_type: String,          // NGO, Foundation, Charity, etc.
  description: String,
  registration_number: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  zip_code: String,
  website: String,
  location_latitude: Number,
  location_longitude: Number,
  verification_status: String,        // PENDING, APPROVED, REJECTED
  verified_by: ObjectId,              // Admin who approved
  verified_date: Date,
  rejection_reason: String,           // If rejected
  is_active: Boolean,
  created_by: ObjectId,               // NGO creator
  registration_document_url: String,  // Document upload path
  createdAt: Date,
  updatedAt: Date
}
```

## API Request/Response Examples

### Approve NGO
```
PUT /api/organizations/:id/approve
Headers: {
  'Authorization': 'Bearer <admin_token>',
  'Content-Type': 'application/json'
}

Response: {
  success: true,
  message: 'Organization approved',
  organization: { ... }
}
```

### Reject NGO
```
PUT /api/organizations/:id/reject
Headers: {
  'Authorization': 'Bearer <admin_token>',
  'Content-Type': 'application/json'
}
Body: {
  rejection_reason: "Incomplete documentation"
}

Response: {
  success: true,
  message: 'Organization rejected',
  organization: { ... }
}
```

## Notifications Flow

### When NGO Registers:
1. Notification created for all admins
2. Type: `NGO_PENDING_APPROVAL`
3. Message: "{Organization Name} has been created and is pending your approval"

### When NGO is Approved:
1. Email sent to NGO with approval confirmation
2. Notification created for NGO creator
3. Type: `ORGANIZATION_APPROVED`

### When NGO is Rejected:
1. Email sent to NGO with rejection reason
2. Notification created for NGO creator
3. Type: `ORGANIZATION_REJECTED`

## File Locations

### Frontend Files
- Admin Dashboard Component: `frontend/src/pages/AdminDashboard.js`
- Admin Dashboard Styles: `frontend/src/pages/AdminDashboard.css`

### Backend Files
- Organization Controller: `backend/controllers/organizationController.js`
- Organization Routes: `backend/routes/organizationRoutes.js`
- Organization Model: `backend/models/Organization.js`
- Email Templates: `backend/utils/emailUtils.js`

## Testing the Feature

### Test Case 1: Register New NGO
1. Logout from admin account
2. Register as a new NGO
3. Login to admin dashboard
4. Check if pending notification appears
5. Verify NGO shows in Pending tab

### Test Case 2: Approve NGO
1. In Admin Dashboard, go to NGOs tab
2. Click "⏳ Pending" filter
3. Click "✓ Approve" button on any pending NGO
4. Verify status changes to "✓ Verified"
5. Verify email sent to NGO

### Test Case 3: Reject NGO
1. In Admin Dashboard, go to NGOs tab
2. Click "⏳ Pending" filter
3. Click "✕ Reject" button
4. Enter rejection reason
5. Verify status changes to REJECTED
6. Verify email sent with reason

## UI/UX Improvements Made

1. **Color-Coded Status Badges**
   - Pending: Amber/Yellow
   - Approved: Green
   - Rejected: Red

2. **Pending Alert Banner**
   - Shows when NGOs need approval
   - Displays count of pending NGOs
   - Animated slide-in effect

3. **Filter Buttons**
   - Quick access to filter by status
   - Active filter highlighted in purple
   - Pending filter shows count in bold

4. **Enhanced Action Buttons**
   - Larger, more visible buttons
   - Loading state with "⏳ Processing..." text
   - Disabled state while processing
   - Keyboard-accessible

5. **Improved Table Row Highlighting**
   - Pending NGOs have yellow background
   - Left border highlight for pending status
   - Hover effect for better interactivity

## Future Enhancements

1. **Bulk Operations**
   - Approve/Reject multiple NGOs at once
   - Batch email notifications

2. **Advanced Filtering**
   - Filter by organization type
   - Filter by registration date range
   - Search by organization name

3. **Document Verification**
   - View uploaded registration documents
   - Add verification checklist
   - Admin comments/notes

4. **Activity Logging**
   - Track all approval/rejection actions
   - Admin audit trail
   - Reason history

5. **Analytics**
   - NGO registration trends
   - Approval/rejection statistics
   - Time-to-approval metrics

## Troubleshooting

### Issue: Approve/Reject button not working
**Solution:** 
- Verify admin token is valid
- Check network tab for API errors
- Ensure organization ID is correct

### Issue: Email not sent
**Solution:**
- Check email service configuration in `backend/config/email.js`
- Verify email templates in `backend/utils/emailUtils.js`
- Check email logs in backend console

### Issue: Status not updating
**Solution:**
- Clear browser cache
- Refresh admin dashboard
- Check database connection

## Support

For issues or questions about the NGO Approval system:
1. Check the admin dashboard error messages
2. Review backend logs
3. Verify database connectivity
4. Test API endpoints manually using Postman

---

**Version:** 1.0
**Last Updated:** December 16, 2025
**Status:** Fully Implemented and Ready for Use
