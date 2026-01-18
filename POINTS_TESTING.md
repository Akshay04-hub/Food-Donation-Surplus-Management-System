# Points System Testing Guide

## Quick Test Steps

### 1. **Test Donor Point Award (Create Donation)**
```
1. Login as Donor
2. Go to Dashboard → Create Donation tab
3. Fill donation form and submit
4. Go to Dashboard → My Profile
5. ✓ Check PointsCard shows +10 points
6. Check Points table in database:
   - New transaction with type: DONATION
   - Points: +10
```

### 2. **Test NGO Point Award (Accept Donation)**
```
1. Login as NGO/Admin user
2. Go to Dashboard → Available Donations
3. Find a donation and click "Accept"
4. Go to Dashboard → My Profile
5. ✓ Check PointsCard shows +5 points
6. Check Points table:
   - New transaction with type: PICKUP
   - Points: +5
```

### 3. **Test Volunteer Point Award (Create Pickup Request)**
```
1. Login as Volunteer
2. Go to Dashboard → Available Donations
3. Find a donation and click "Request Pickup"
4. Fill pickup details and submit
5. Go to Dashboard → My Profile
6. ✓ Check PointsCard shows +5 points
7. Check Points table:
   - New transaction with type: PICKUP
   - Points: +5
```

### 4. **Test Volunteer Additional Points (Mark as Picked Up)**
```
1. Login as Volunteer
2. Go to Dashboard → Pending Pickups
3. Find a confirmed pickup and click "Mark as Picked Up"
4. Go to Dashboard → My Profile
5. ✓ Check PointsCard shows +5 additional points
6. Check Points table:
   - New transaction with type: PICKUP
   - Points: +5
```

### 5. **Test Transaction History**
```
1. Login as any user with donations/pickups
2. Go to Dashboard → My Profile
3. Click "View Full History" or navigate to /points-history
4. ✓ Verify all transactions are listed
5. ✓ Verify pagination works (if more than 20 transactions)
```

### 6. **Test Leaderboard**
```
1. Navigate to /points-history
2. Go to "Leaderboard" tab
3. ✓ Verify users are ranked by points (highest first)
4. ✓ Verify top 3 have medal badges (🥇 🥈 🥉)
5. ✓ Verify points earned and current balance match
```

## Database Verification

### Check User Points
```javascript
// MongoDB
db.users.findOne({ email: "test@example.com" }, {
  redeemable_points: 1,
  total_points_earned: 1,
  total_points_redeemed: 1,
  points_last_updated: 1
})

// Expected for donor who created 1 donation:
{
  redeemable_points: 10,
  total_points_earned: 10,
  total_points_redeemed: 0,
  points_last_updated: [timestamp]
}

// Expected for volunteer who accepted + picked up:
{
  redeemable_points: 10,
  total_points_earned: 10,
  total_points_redeemed: 0,
  points_last_updated: [timestamp]
}
```

### Check Points Transactions
```javascript
// MongoDB
db.points.find({ user_id: ObjectId("...") }).sort({ createdAt: -1 })

// Expected records:
[
  {
    transaction_type: "PICKUP",
    points: 5,
    description: "Completed pickup for donation"
  },
  {
    transaction_type: "PICKUP",
    points: 5,
    description: "Volunteered for pickup: ..."
  },
  {
    transaction_type: "PICKUP",
    points: 5,
    description: "Accepted donation: ..."
  },
  {
    transaction_type: "DONATION",
    points: 10,
    description: "Donated ... of ..."
  }
]
```

## API Testing (Postman/cURL)

### Get User Points
```bash
curl -X GET http://localhost:5000/api/points/my-points \
  -H "Authorization: Bearer [token]"

# Response:
{
  "success": true,
  "points": {
    "redeemable_points": 10,
    "total_earned": 10,
    "total_redeemed": 0,
    "last_updated": "2024-12-08T..."
  }
}
```

### Get Transaction History
```bash
curl -X GET "http://localhost:5000/api/points/history?page=1&limit=10" \
  -H "Authorization: Bearer [token]"

# Response:
{
  "success": true,
  "history": [
    {
      "_id": "...",
      "transaction_type": "DONATION",
      "points": 10,
      "description": "Donated 5 kg of rice",
      "createdAt": "2024-12-08T..."
    }
  ],
  "pagination": {
    "page": 1,
    "totalPages": 1,
    "totalCount": 1,
    "limit": 10
  }
}
```

### Get Leaderboard
```bash
curl -X GET "http://localhost:5000/api/points/leaderboard?limit=10"

# Response:
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "name": "John Doe",
      "redeemable_points": 50,
      "total_points_earned": 50
    }
  ]
}
```

## Frontend Testing Checklist

- [ ] PointsCard appears in user profile
- [ ] PointsCard shows correct points balance
- [ ] PointsCard shows correct tier badge
- [ ] Click toggle shows detailed breakdown
- [ ] "View Full History" button works
- [ ] Points history page loads correctly
- [ ] Transaction list displays with correct data
- [ ] Pagination works if more than 20 transactions
- [ ] Leaderboard tab shows top users
- [ ] Top 3 have medal badges
- [ ] How it Works tab displays earning rules
- [ ] Mobile responsive layout works

## Common Issues & Solutions

### Issue: Points not increasing after donation
**Solution**: 
- Check if `awardPoints` function is being called in `createDonation`
- Verify user ID is being passed correctly
- Check Points table is created in MongoDB
- Check browser console for any errors

### Issue: NGO profile not showing increased points
**Solution**:
- Verify `acceptDonation` function includes `awardPoints` call
- Check if NGO user ID is correctly retrieved
- Verify donation.status changes to 'ALLOCATED'
- Check Points transaction table for PICKUP type entries

### Issue: Points card shows 0 but should show points
**Solution**:
- Refresh browser page
- Clear localStorage cache
- Check API response: `GET /api/points/my-points`
- Verify backend server is running
- Check network tab in browser DevTools

### Issue: Leaderboard doesn't show any users
**Solution**:
- Verify at least one user has points
- Check Points collection is not empty
- Verify User collection has redeemable_points field
- Try refreshing leaderboard page

## Performance Testing

Monitor these metrics while testing:
- Points award latency (should be < 500ms non-blocking)
- Transaction history pagination (< 1s for 20 records)
- Leaderboard query (< 1s for top 10)
- PointsCard load time (< 500ms)

---

**Last Updated**: December 8, 2024
