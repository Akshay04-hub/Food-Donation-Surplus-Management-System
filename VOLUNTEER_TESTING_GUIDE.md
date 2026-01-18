# Testing Guide: Volunteer Donation Acceptance

## Quick Test Steps

### Setup
1. Have 3 user accounts ready:
   - **Donor** account
   - **Volunteer** account
   - **NGO** account (optional, for comparison)

### Test Flow

#### Step 1: Create a Donation (as Donor)
1. Login as **Donor**
2. Go to "Create Donation" tab
3. Fill in donation details:
   - Food Name: "Rice"
   - Food Type: "RAW"
   - Quantity: 10 kg
   - Address and contact details
4. Submit donation
5. Go to "History" tab
6. ✅ Verify donation appears with status "AVAILABLE"

#### Step 2: NGO Rejects Donation (Optional - to test volunteer pickup of rejected donations)
1. Login as **NGO**
2. Go to "Available Donations" tab
3. Find the Rice donation
4. Click "Reject"
5. ✅ Verify rejection success message

#### Step 3: Volunteer Accepts Donation
1. Login as **Volunteer**
2. Go to "Available Donations" tab
3. Find the Rice donation
4. Click "Accept" button
5. ✅ Verify alert: "Donation accepted successfully! Check Notifications/History for details."
6. ✅ Verify donation is removed from Available Donations list

#### Step 4: Verify Volunteer History
1. Stay logged in as **Volunteer**
2. Go to "History" tab
3. ✅ **MAIN FIX**: Verify the Rice donation appears in history
4. ✅ Verify it shows:
   - Food type: Rice
   - Status badge: ALLOCATED
   - Quantity: 10 KG
   - Donor information
   - All other donation details

#### Step 5: Verify Donor History
1. Logout and login as **Donor**
2. Go to "History" tab
3. ✅ Verify the Rice donation shows:
   - Status badge: ALLOCATED
   - "Accepted by: VOLUNTEER"
   - Volunteer's name with 🙋 emoji
   - All donation details intact

### Expected Results Summary

| View | Expected Behavior |
|------|-------------------|
| **Volunteer → Available Donations** | Shows AVAILABLE donations (including rejected by NGO) |
| **Volunteer → History** | Shows all donations accepted by this volunteer (ALLOCATED status) |
| **Donor → History** | Shows all their donations with acceptor info (NGO or Volunteer name) |
| **Donor → History (Accepted)** | Shows "Accepted by: VOLUNTEER" + volunteer name |

## Database Verification (Optional)

Connect to MongoDB and run:

```javascript
// Find donations accepted by volunteers
db.donations.find({ 
  "accepted_by.role": "VOLUNTEER",
  "status": "ALLOCATED"
})

// Expected output structure:
{
  _id: ObjectId("..."),
  status: "ALLOCATED",
  accepted_by: {
    user: ObjectId("..."),  // volunteer user ID
    name: "John Doe",       // volunteer name
    role: "VOLUNTEER"       // role
  },
  donor: ObjectId("..."),   // donor user ID
  food_type: "Rice",
  // ... other fields
}
```

## Troubleshooting

### Issue: Volunteer history is empty after accepting donation
**Check:**
1. Ensure volunteer clicked "Accept" (not just viewing)
2. Verify API call succeeded (check Network tab in browser DevTools)
3. Check backend logs for any errors
4. Verify `accepted_by.role` is set to "VOLUNTEER" in database

### Issue: Donor doesn't see volunteer info
**Check:**
1. Ensure `accepted_by.name` is populated in database
2. Frontend should show volunteer emoji 🙋 if no organization
3. Check that `d.accepted_by.organization` is null for volunteer acceptance

### Issue: Donation still shows as AVAILABLE
**Check:**
1. Backend should change status to "ALLOCATED" upon acceptance
2. Verify authorization middleware allows VOLUNTEER role to accept
3. Check donationRoutes.js line 49: `roleCheck('NGO', 'VOLUNTEER')`

## Success Criteria

✅ **Before Fix:**
- Volunteer accepts donation → History tab is empty

✅ **After Fix:**
- Volunteer accepts donation → History tab shows the accepted donation
- Donor sees volunteer name in their history
- Status changes to ALLOCATED
- Points awarded to volunteer
- Activity log records the acceptance

## API Endpoints Reference

```
POST /api/donations/:id/accept
Authorization: Bearer <token>
Role: NGO or VOLUNTEER

GET /api/donations/history/my
Authorization: Bearer <token>
Returns donations based on user role:
- DONOR: All created donations
- NGO: Accepted donations
- VOLUNTEER: Accepted donations + Pickup requests
```
