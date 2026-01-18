# Redeemable Points System 🎁

## Overview

The Redeemable Points System is a gamification feature that rewards users for actively participating in the food donation platform. Users earn points through donations and volunteer activities, can track their achievements, and potentially redeem points for rewards.

## Features

### 1. **Point Earning**
- **Donation Creation**: +10 points
  - Users earn points every time they create a food donation
  - Points are awarded immediately upon donation creation

- **Donation Acceptance (NGO/Volunteer)**: +5 points
  - NGOs and volunteers earn points when they accept/respond to a donation
  - Points awarded when donation is accepted OR when pickup request is created
  - This encourages NGOs and volunteers to actively participate

- **Pickup Completion**: +5 points (additional)
  - Volunteers earn additional points when they mark a pickup as completed
  - Points awarded when pickup is marked as "PICKED_UP"

### 2. **Point Distribution Timeline**
```
Donor Journey:
├── Creates Donation → +10 points (immediate)
└── Food is accepted → No additional points

NGO/Volunteer Journey:
├── Accepts Donation (via acceptDonation or createPickupRequest) → +5 points
└── Marks as Picked Up → +5 more points
    Total: +10 points per completed pickup
```

### 2. **User Profile Integration**
- Points display card on user profile page with:
  - Current redeemable points balance
  - Total points earned
  - Total points redeemed
  - Achievement tier badge (Bronze, Silver, Gold, Platinum)
  - Last updated timestamp

### 3. **Points History**
- Comprehensive transaction history showing:
  - Transaction type (Donation, Pickup, Redemption, etc.)
  - Points awarded/deducted
  - Description of the activity
  - Date of transaction
  - Pagination support (20 records per page)

### 4. **Leaderboard**
- Top donors and volunteers ranked by points
- Display user profile, earned points, and current balance
- Medal badges for top 3 users (🥇 🥈 🥉)
- Publicly visible for motivation

### 5. **Achievement Tiers**
- **Bronze**: 0+ points (starter)
- **Silver**: 100+ points (active contributor)
- **Gold**: 250+ points (dedicated volunteer)
- **Platinum**: 500+ points (champion)

## Backend Implementation

### Database Changes

#### Updated User Model
```javascript
// Added fields to User schema
redeemable_points: Number (default: 0)
total_points_earned: Number (default: 0)
total_points_redeemed: Number (default: 0)
points_last_updated: Date
```

### New Models

#### Points Model (`/backend/models/Points.js`)
Tracks all point transactions with the following fields:
- `user_id`: Reference to user
- `transaction_type`: DONATION, PICKUP, VOLUNTEER_ACTIVITY, REDEMPTION, BONUS, ADJUSTMENT
- `points`: Number of points (+/-)
- `description`: Transaction description
- `related_donation_id`: Link to donation (if applicable)
- `related_pickup_request_id`: Link to pickup (if applicable)
- `is_reversed`: Flag for reversed transactions
- `reversal_reason`: Reason for reversal
- `metadata`: Additional transaction data

### Utility Functions (`/backend/utils/pointsUtils.js`)

**Core Functions:**
- `awardPoints(userId, points, transactionType, description, metadata)` - Award points to user
- `redeemPoints(userId, points, description)` - Redeem points with balance check
- `getPointsSummary(userId)` - Get user's points summary
- `getTransactionHistory(userId, limit, skip)` - Get paginated transaction history
- `getLeaderboard(limit)` - Get top users by points
- `reversePoints(transactionId, reason)` - Reverse a transaction

**Constants:**
```javascript
POINTS_CONFIG = {
  DONATION: 10,
  PICKUP: 5,
  VOLUNTEER_ACTIVITY: 3,
  BONUS: 0
}
```

### Controllers

#### Points Controller (`/backend/controllers/pointsController.js`)

**Endpoints:**
- `GET /api/points/my-points` - Get user's points summary
- `GET /api/points/history` - Get transaction history (paginated)
- `GET /api/points/leaderboard` - Get leaderboard
- `GET /api/points/info` - Get points system information
- `POST /api/points/redeem` - Redeem points for rewards

#### Updated Controllers

**Donation Controller:**
- Modified `createDonation` to award 10 points to donor after donation is created
- Modified `acceptDonation` to award 5 points to NGO/volunteer when they accept the donation
- Points award is non-blocking (errors don't affect operations)

**Pickup Controller:**
- Modified `createPickupRequest` to award 5 points to volunteer/receiver when they create a pickup request
- Modified `markAsPickedUp` to award 5 additional points to volunteer/picker when pickup is completed
- Safely handles cases where volunteer ID might not be available

### Routes (`/backend/routes/pointsRoutes.js`)

All routes are protected with authentication middleware:
```javascript
GET  /api/points/my-points        - User's points
GET  /api/points/history          - Transaction history
GET  /api/points/leaderboard      - Leaderboard
GET  /api/points/info             - System info
POST /api/points/redeem           - Redeem points
```

## Frontend Implementation

### Components

#### PointsCard (`/frontend/src/components/PointsCard.js`)
- Displays points summary in profile
- Shows current redeemable points in large format
- Shows achievement tier with emoji badge
- Expandable details section showing:
  - Total earned points
  - Total redeemed points
  - Last updated date
  - How to earn points guide
  - Link to full points history

#### PointsCard Styling (`/frontend/src/components/PointsCard.css`)
- Gradient background (purple to blue)
- Responsive design
- Hover effects and animations
- Mobile-optimized layout

### Pages

#### PointsPage (`/frontend/src/pages/PointsPage.js`)
Comprehensive page with 3 tabs:

1. **History Tab**
   - Transaction history with pagination
   - Color-coded by transaction type
   - Shows points awarded/deducted
   - Dates and descriptions

2. **Leaderboard Tab**
   - Top 10 users by points
   - Medal badges for top 3
   - User profile pictures
   - Points earned and current balance

3. **How it Works Tab**
   - Point earning rules
   - Achievement tiers
   - Reward information
   - Visual cards for easy understanding

#### PointsPage Styling (`/frontend/src/pages/PointsPage.css`)
- Full page gradient background
- Tab navigation UI
- Transaction list styling
- Leaderboard card layout
- Information cards for rules and tiers
- Fully responsive design

### API Service

#### Points API (`/frontend/src/services/api.js`)

```javascript
export const pointsAPI = {
  getUserPoints: () => apiClient.get('/points/my-points'),
  getTransactionHistory: (page, limit) => 
    apiClient.get('/points/history', { params: { page, limit } }),
  getLeaderboard: (limit) => 
    apiClient.get('/points/leaderboard', { params: { limit } }),
  getPointsInfo: () => apiClient.get('/points/info'),
  redeemPoints: (points, description) => 
    apiClient.post('/points/redeem', { points, description }),
};
```

### Routing

Added new protected route in `App.js`:
```javascript
<Route
  path="/points-history"
  element={<PrivateRoute element={<PointsPage />} />}
/>
```

## How to Use

### For Users

1. **View Points in Profile**
   - Navigate to Dashboard → My Profile tab
   - See PointsCard with current points and tier
   - Click toggle button to see detailed breakdown

2. **Earn Points**
   - **Donor**: Create a donation → +10 points immediately
   - **NGO/Volunteer**: Accept a donation (via acceptDonation or createPickupRequest) → +5 points
   - **Volunteer**: Complete a pickup → +5 additional points
   - Points awarded automatically

3. **Track History**
   - Click "View Full History" in PointsCard
   - Or navigate to `/points-history`
   - See all your transactions with dates and amounts

4. **View Leaderboard**
   - On PointsPage, go to Leaderboard tab
   - See top donors and volunteers
   - Track your ranking

### For Developers

1. **Award Points Manually**
```javascript
const { awardPoints, POINTS_CONFIG } = require('../utils/pointsUtils');

// Award points
await awardPoints(
  userId,
  POINTS_CONFIG.DONATION,
  'DONATION',
  'Donated 5kg of cooked rice',
  { donationId: donation._id }
);
```

2. **Get User Points**
```javascript
const { getPointsSummary } = require('../utils/pointsUtils');
const summary = await getPointsSummary(userId);
// Returns: { redeemable_points, total_earned, total_redeemed, last_updated }
```

3. **Redeem Points**
```javascript
const { redeemPoints } = require('../utils/pointsUtils');
await redeemPoints(userId, 100, 'Redeemed for discount coupon');
```

## API Response Examples

### Get User Points
```json
{
  "success": true,
  "points": {
    "redeemable_points": 245,
    "total_earned": 345,
    "total_redeemed": 100,
    "last_updated": "2024-12-08T10:30:00Z"
  }
}
```

### Get Transaction History
```json
{
  "success": true,
  "history": [
    {
      "_id": "....",
      "user_id": "....",
      "transaction_type": "DONATION",
      "points": 10,
      "description": "Donated 5kg of rice",
      "createdAt": "2024-12-08T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "totalPages": 5,
    "totalCount": 87,
    "limit": 20
  }
}
```

### Get Leaderboard
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "name": "John Donor",
      "redeemable_points": 523,
      "total_points_earned": 623
    }
  ]
}
```

## Testing

### Manual Testing Steps

1. **Create a Donation**
   - User makes a donation
   - Check database: User's `redeemable_points` should increase by 10
   - Check Points table: New DONATION transaction created

2. **Complete a Pickup**
   - Volunteer completes a pickup
   - Check database: Volunteer's `redeemable_points` should increase by 5
   - Check Points table: New PICKUP transaction created

3. **View Points in Profile**
   - Go to Dashboard → My Profile
   - See PointsCard with correct balance
   - Click toggle to see details

4. **Check Transaction History**
   - Navigate to `/points-history`
   - Verify all transactions are listed
   - Test pagination

5. **View Leaderboard**
   - Go to `/points-history` → Leaderboard tab
   - Verify correct ranking
   - Verify top 3 have medal badges

## Future Enhancements

1. **Reward Marketplace**
   - Allow users to redeem points for actual rewards
   - Coupons, discounts, badges
   - Integration with payment system

2. **Seasonal Bonuses**
   - Double points during certain periods
   - Special events with bonus multipliers

3. **Achievement Badges**
   - Unlock special badges for milestones
   - "First Donation", "Century Donor", etc.

4. **Referral Points**
   - Earn points for referring new users
   - Bonus when referred user completes first donation

5. **Points Expiry**
   - Optional expiry to encourage regular activity
   - Rolling 1-year validity

6. **Admin Dashboard**
   - View system-wide points statistics
   - Manually award/deduct points
   - Manage point values and tiers

## Files Modified/Created

### Created Files:
- `/backend/models/Points.js`
- `/backend/utils/pointsUtils.js`
- `/backend/controllers/pointsController.js`
- `/backend/routes/pointsRoutes.js`
- `/frontend/src/components/PointsCard.js`
- `/frontend/src/components/PointsCard.css`
- `/frontend/src/pages/PointsPage.js`
- `/frontend/src/pages/PointsPage.css`

### Modified Files:
- `/backend/models/User.js` - Added points fields
- `/backend/controllers/donationController.js` - Added points award logic
- `/backend/controllers/pickupRequestController.js` - Added points award logic
- `/backend/server.js` - Added points routes
- `/frontend/src/services/api.js` - Added pointsAPI
- `/frontend/src/App.js` - Added PointsPage route
- `/frontend/src/pages/DashboardPage.js` - Added PointsCard to profile

## Error Handling

- All point transactions are non-blocking
- Points award failures don't prevent core operations
- Insufficient points validation for redemptions
- Transaction logging for audit trails
- Reversal capability for corrections

## Performance Considerations

- Points transactions are indexed on user_id and createdAt
- Leaderboard queries use sorting and limiting
- Pagination implemented for transaction history
- PointsCard loads independently on profile
- All endpoints use proper caching strategies

---

**Version**: 1.0  
**Last Updated**: December 8, 2024  
**Status**: Active
