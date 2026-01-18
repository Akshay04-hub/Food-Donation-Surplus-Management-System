# Volunteer Donation Acceptance Fix

## Problem Description
When a volunteer clicked "Accept" on a donation in their dashboard, the donation was not appearing as accepted in:
1. The volunteer's history tab
2. The donor's history tab (showing which volunteer accepted it)

## Root Cause
The backend `getMyDonationHistory` function was only showing **PickupRequests** for volunteers, but not donations they accepted directly through the `acceptDonation` endpoint.

When a volunteer accepted a donation:
- ✅ Backend changed donation status to 'ALLOCATED'
- ✅ Backend stored volunteer info in `accepted_by` field
- ✅ Frontend showed success alert
- ❌ Volunteer's history didn't show the accepted donation
- ✅ Donor's history showed the acceptance (this was already working)

## Solution Implemented

### Backend Changes (donationController.js)

Modified the `getMyDonationHistory` function for VOLUNTEER role to include:

1. **Donations accepted directly** by the volunteer (via Accept button):
   ```javascript
   const acceptedDonations = await Donation.find({
     'accepted_by.user': userId,
     'accepted_by.role': 'VOLUNTEER',
     status: { $in: ['ALLOCATED', 'PICKED_UP', 'COMPLETED', 'CANCELLED'] }
   })
   ```

2. **PickupRequests created** by the volunteer (existing functionality maintained)

3. Combined both lists and sorted by creation date

### File Modified
- `backend/controllers/donationController.js` (lines 913-934)

## Flow After Fix

### When Volunteer Accepts a Donation:

1. **Volunteer clicks "Accept" button** in Available Donations tab
   - Frontend: `handleAcceptDonation(donationId)` is called
   - API: `POST /donations/:id/accept`

2. **Backend processes acceptance**
   - Changes donation status from 'AVAILABLE' to 'ALLOCATED'
   - Stores volunteer info in `accepted_by` object:
     ```javascript
     {
       user: volunteerId,
       name: "Volunteer Name",
       role: "VOLUNTEER"
     }
     ```
   - Awards points to volunteer
   - Creates activity log entry
   - Notifies donor

3. **Frontend updates**
   - Removes donation from Available Donations list
   - Shows success alert
   - Reloads notifications
   - Reloads history

4. **History Tab now shows:**
   - **Volunteer's History**: Lists all donations they accepted (status: ALLOCATED, PICKED_UP, etc.)
   - **Donor's History**: Shows which volunteer/NGO accepted their donation with full details

## Testing Checklist

- [ ] Volunteer can see accepted donations in History tab
- [ ] Donor can see volunteer name in their History tab
- [ ] Acceptance status is displayed correctly (ALLOCATED)
- [ ] Volunteer info (name, role) is visible to donor
- [ ] Points are awarded to volunteer upon acceptance
- [ ] Notifications are created for donor
- [ ] Activity log records the acceptance action

## Database Schema Reference

### Donation Model (accepted_by field)
```javascript
accepted_by: {
  user: ObjectId (ref: User),
  name: String,
  organization: ObjectId (ref: Organization),
  role: String (enum: ['NGO', 'VOLUNTEER']),
  rejected: Boolean
}
```

## API Endpoints Used

1. **Accept Donation**
   - `POST /api/donations/:id/accept`
   - Auth: Required (NGO or VOLUNTEER)
   - Returns: Updated donation object

2. **Get My History**
   - `GET /api/donations/history/my`
   - Auth: Required
   - Returns: Array of donations based on user role:
     - DONOR: All their created donations
     - NGO: Donations they accepted
     - VOLUNTEER: Donations they accepted + PickupRequests they created

## Notes

- The fix maintains backward compatibility with existing PickupRequest functionality
- Both direct acceptance and pickup requests are now visible in volunteer history
- Donor history already showed acceptor info correctly; no changes needed there
- The solution handles both NGO and VOLUNTEER acceptance flows properly
