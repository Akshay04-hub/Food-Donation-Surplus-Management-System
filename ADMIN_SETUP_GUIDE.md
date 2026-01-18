# Admin Dashboard - Setup & Testing Guide

## Prerequisites
- Node.js and npm installed
- MongoDB running
- Backend and frontend setup complete

## Step-by-Step Setup

### Step 1: Create Admin User

Open terminal in project root:

```bash
cd backend
node scripts/createAdminUser.js
```

Expected output:
```
Connected to MongoDB
✓ Admin user created successfully!
  Email: admin@fooddonation.com
  Password: Admin@123

You can now login with these credentials.
```

> **Note**: If you see "Admin user already exists", the admin is already created and you can proceed to login.

### Step 2: Start Backend Server

In the backend directory:

```bash
npm start
```

Expected output:
```
✓ Connected to MongoDB
✓ Server running on port 5000
```

### Step 3: Start Frontend

Open a new terminal, navigate to frontend:

```bash
cd frontend
npm start
```

Browser should automatically open to `http://localhost:3000`

### Step 4: Access Admin Dashboard

1. **On Landing Page**:
   - You should see 4 role cards: Donor, NGO, Volunteer, **Admin**
   - The Admin card has a purple gradient and 👨‍💼 icon

2. **Click Admin Role**:
   - Click on the "Admin" card
   - You'll see "You selected Admin"

3. **Click Sign In**:
   - Click the "Sign In" button
   - This takes you to the login page

4. **Login with Admin Credentials**:
   - **Email**: `admin@fooddonation.com`
   - **Password**: `Admin@123`
   - Click "Sign In"

5. **Automatic Redirect**:
   - After successful login, you'll be automatically redirected to `/admin-dashboard`
   - The system detects your ADMIN role and routes you appropriately

### Step 5: Explore Dashboard

#### Overview Tab (Default)
You should see 7 statistics cards:
- 📊 Total Users
- 👥 Total Donors
- 🏢 Total NGOs
- 🤝 Total Volunteers
- 🎁 Total Donations
- 🚚 Total Pickups
- ⭐ Total Points

Each card displays the current count from your database.

#### Users Tab
Click the "Users" tab to see:
- Complete list of all registered users
- Columns: Name, Email, Role, Points, Status, Join Date
- Color-coded role badges (Donor=green, NGO=orange, Volunteer=pink)

#### Donations Tab
Click the "Donations" tab to see:
- All donation records
- Columns: Donor, Category, Quantity, NGO, Status, Date
- Status badges (Pending=gray, Accepted=blue, Completed=green)

#### Pickups Tab
Click the "Pickups" tab to see:
- All pickup requests
- Columns: Requester, Location, Volunteer, Status, Scheduled Time
- Status badges for different pickup states

## Verification Checklist

Use this checklist to verify everything works:

### Frontend Verification
- [ ] Landing page shows 4 role cards including Admin
- [ ] Admin card has purple gradient
- [ ] Admin card has 👨‍💼 icon
- [ ] Clicking Admin shows "You selected Admin"
- [ ] Sign In button appears
- [ ] Login page loads correctly
- [ ] After login, redirects to `/admin-dashboard`
- [ ] Dashboard has purple gradient header
- [ ] Dashboard shows "Admin Dashboard" title
- [ ] Logout button appears in header

### Dashboard Content Verification
- [ ] 7 stat cards visible
- [ ] Stats show actual numbers (not all zeros)
- [ ] 4 tabs visible: Overview, Users, Donations, Pickups
- [ ] Overview tab is active by default
- [ ] Clicking tabs switches content
- [ ] Loading spinner appears briefly when fetching data

### Users Tab Verification
- [ ] User table displays
- [ ] Table headers: Name, Email, Role, Points, Status, Join Date
- [ ] At least admin user appears in table
- [ ] Role badges have colors
- [ ] Dates are formatted properly
- [ ] Points display correctly

### Donations Tab Verification
- [ ] Donations table displays
- [ ] Shows message if no donations exist
- [ ] If donations exist, displays in table format
- [ ] Status badges colored appropriately

### Pickups Tab Verification
- [ ] Pickups table displays
- [ ] Shows message if no pickups exist
- [ ] If pickups exist, displays in table format
- [ ] Scheduled times formatted properly

### Security Verification
- [ ] Non-admin users cannot access `/admin-dashboard`
- [ ] Direct URL access redirects if not admin
- [ ] Admin routes require authentication
- [ ] Token is sent with all API requests

## Common Issues & Solutions

### Issue 1: "Admin user already exists"
**Solution**: This is normal. The admin was created in a previous run. Just proceed to login.

### Issue 2: Login fails with 401 error
**Possible causes**:
- Wrong credentials
- Backend server not running
- Database connection issue

**Solution**:
- Verify credentials: admin@fooddonation.com / Admin@123
- Check backend terminal for errors
- Ensure MongoDB is running

### Issue 3: Dashboard shows empty tables
**Cause**: No data in database yet

**Solution**: This is expected if you just set up the project. To test with data:
1. Register some test users (donors, NGOs, volunteers)
2. Create some donations
3. Create pickup requests
4. Refresh admin dashboard

### Issue 4: 403 Forbidden error
**Cause**: User role is not ADMIN

**Solution**: 
- Ensure you logged in with admin@fooddonation.com
- Check JWT token includes role: ADMIN
- Verify authMiddleware is working

### Issue 5: Stats show 0 or NaN
**Cause**: Database queries failing

**Solution**:
- Check backend console for errors
- Verify MongoDB connection
- Check if collections exist in database

### Issue 6: Page redirects unexpectedly
**Cause**: Role detection redirecting users

**Solution**: 
- ADMIN users auto-redirect to /admin-dashboard (expected)
- Other users redirect to /dashboard (expected)
- Check user role in localStorage

## API Testing with Postman/Thunder Client

You can also test the admin APIs directly:

### 1. Login to Get Token
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@fooddonation.com",
  "password": "Admin@123"
}
```

Copy the `token` from response.

### 2. Get All Users
```http
GET http://localhost:5000/api/admin/users
Authorization: Bearer YOUR_TOKEN_HERE
```

### 3. Get All Donations
```http
GET http://localhost:5000/api/admin/donations
Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Get All Pickups
```http
GET http://localhost:5000/api/admin/pickups
Authorization: Bearer YOUR_TOKEN_HERE
```

Expected response format:
```json
{
  "success": true,
  "users": [...],  // or donations, pickups
}
```

## Database Verification

You can check MongoDB directly:

```javascript
// In MongoDB Compass or shell
use food-donation-db

// Check admin user exists
db.users.findOne({ role: 'ADMIN' })

// Count documents
db.users.countDocuments()
db.donations.countDocuments()
db.pickuprequests.countDocuments()
```

## Adding Test Data

To see the dashboard with more data:

### Create Test Donors
1. Go to landing page
2. Select "Donor" role
3. Register with test email
4. Repeat 2-3 times

### Create Test NGOs
1. Select "NGO" role
2. Register with test organization
3. Repeat 2-3 times

### Create Test Donations
1. Login as donor
2. Navigate to donation form
3. Create sample donations

### Create Test Pickups
1. Login as NGO or volunteer
2. Create pickup requests

After adding data, refresh admin dashboard to see updated statistics.

## Logout and Re-login

To test logout:
1. Click "Logout" button in admin dashboard header
2. Should redirect to landing page
3. Token should be cleared from localStorage
4. Login again should work normally

## Mobile Testing

The dashboard is responsive. Test on mobile:
1. Open browser developer tools (F12)
2. Toggle device toolbar (mobile view)
3. Dashboard should adapt layout
4. Tables should have horizontal scroll if needed

## Performance Notes

- Initial load fetches all data (may take 1-2 seconds with large datasets)
- Statistics are calculated server-side
- Data is cached in component state
- Switching tabs doesn't re-fetch data

## Next Steps After Verification

Once everything is working:
1. ✅ Admin dashboard is fully functional
2. ✅ You can monitor all platform activities
3. ✅ Statistics are displayed correctly
4. ✅ All tabs work properly

Optional enhancements you can add:
- User management buttons (activate/deactivate)
- Export data to CSV
- Analytics charts
- Search and filters in tables
- Pagination for large datasets

## Support Documentation

For more details, see:
- `ADMIN_DASHBOARD_GUIDE.md` - Full implementation details
- `ADMIN_DASHBOARD_QUICK_REF.md` - Quick reference
- `ADMIN_IMPLEMENTATION_SUMMARY.md` - Feature summary

## Summary

✅ **Admin user created**: admin@fooddonation.com / Admin@123  
✅ **Dashboard accessible**: http://localhost:3000/admin-dashboard  
✅ **7 statistics displayed**: Users, Donors, NGOs, Volunteers, Donations, Pickups, Points  
✅ **4 tabs functional**: Overview, Users, Donations, Pickups  
✅ **Security implemented**: Role-based access control  
✅ **Responsive design**: Works on desktop and mobile  

Your admin dashboard is ready to use! 🎉
