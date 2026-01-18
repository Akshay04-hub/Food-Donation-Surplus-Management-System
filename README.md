# 🍽️ Food Donation & Surplus Management System

A comprehensive full-stack web application that connects food donors (individuals, hostels, restaurants) with NGOs and volunteers to reduce food waste and support communities in need.

## ✨ Key Features

### 🎯 Core Functionality

#### User Roles & Registration
- **Donor**: Individuals, Hostels, and Restaurants can donate surplus food
  - Home Donors: Owner Name, Address, Phone
  - Hostel Donors: Hostel Name, Owner Name, Address, Phone
  - Restaurant Donors: Restaurant Name, Owner Name, Address, Phone
- **NGO**: Register organizations to receive and distribute food
- **Volunteer**: Help coordinate pickups and distributions
- **Admin**: Manage system, approve organizations, view analytics

#### Donor Management
- **Donor Type Selection**: Choose between Home, Hostels, or Restaurants during signup
- **Tailored Registration Forms**: Different fields based on donor type
- **Donation Creation**: Post surplus food with details (type, quantity, unit)
- **Donation Tracking**: View created donations and their status

#### NGO Workflow
- **Organization Registration**: Create NGO with name, address, contact details
- **Admin Approval**: NGOs must be approved by admin before accepting donations
- **Donation Acceptance**: View available donations and accept/reject them
- **Notification System**: Real-time updates when donations are received

#### Volunteer System
- **Donation Acceptance**: See only donations rejected by NGOs
- **Pickup Coordination**: Organize and execute food pickups
- **Activity Tracking**: View history of pickups and distributions

#### Admin Dashboard
- **Organization Management**: View all registered NGOs with approval controls
- **User Management**: Monitor donors, volunteers, and organizations
- **Activity Monitoring**: Track donations, pickups, and system usage
- **Analytics**: View donation statistics and impact metrics

### 🔄 Donation Visibility Chain
1. **Donor Creates Donation** → Visible to Donor & NGOs
2. **NGO Accepts or Rejects**
   - **Accept**: Status changes to ALLOCATED
   - **Reject**: Donation becomes visible to Volunteers
3. **Volunteer Picks Up**: Updates status to PICKED_UP or COMPLETED

### 💰 Points System
- **Earn Points**: Donors earn points for each donation
- **Redeem Points**: Convert accumulated points to vouchers
- **Track Points**: View earned and redeemed points in dashboard
- **Point History**: Complete audit trail of point transactions

### 📱 Additional Features
- **Role-Based Login Validation**: Prevents login with mismatched role credentials
- **10-Digit Phone Validation**: All users must provide valid 10-digit phone numbers
- **Email Notifications**: Automatic emails for registration, donations, pickups
- **Activity Logging**: Track all user actions for audit purposes
- **Multi-Language Support**: Available in multiple languages
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Background Image**: Beautiful donation-themed background on donor type selection page

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Email Service**: Nodemailer
- **API Testing**: Postman compatible

### Frontend
- **Library**: React 18+
- **Styling**: CSS3, Custom CSS with Gradients
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **State Management**: React Hooks (useState, useContext)
- **Notifications**: Custom toast alerts
- **Internationalization**: Custom language context

## 📁 Project Structure

```
mini-project-original/
├── backend/
│   ├── models/
│   │   ├── User.js              # User schema with donor-specific fields
│   │   ├── Donation.js
│   │   ├── Organization.js
│   │   ├── Notification.js
│   │   ├── PickupRequest.js
│   │   ├── Points.js
│   │   ├── ActivityLog.js
│   │   ├── Message.js
│   │   └── Rating.js
│   ├── controllers/
│   │   ├── authController.js    # Registration with donor type handling
│   │   ├── donationController.js
│   │   ├── adminController.js
│   │   ├── notificationController.js
│   │   ├── pointsController.js
│   │   └── [other controllers]
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── donationRoutes.js
│   │   ├── adminRoutes.js
│   │   └── [other routes]
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── roleCheck.js         # Role-based access control
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── auditLog.js
│   ├── utils/
│   │   ├── passwordUtils.js
│   │   ├── jwtUtils.js
│   │   ├── emailUtils.js
│   │   └── pointsUtils.js
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── email.js
│   └── server.js                # Main server file
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js      # Conditional fields for donor types
│   │   │   ├── DonorTypeSelection.js # New donor type selection page
│   │   │   ├── DashboardPage.js     # Role-based dashboard
│   │   │   ├── AdminDashboard.js
│   │   │   └── [other pages]
│   │   ├── components/
│   │   │   ├── PrivateRoute.js
│   │   │   ├── LanguageSelector.js
│   │   │   └── [other components]
│   │   ├── services/
│   │   │   └── api.js               # Axios API configuration
│   │   ├── context/
│   │   │   └── LanguageContext.js
│   │   ├── assets/
│   │   │   └── Donation1.webp
│   │   └── App.js
│   └── package.json
│
├── package.json
├── setup.bat                    # Windows setup script
├── setup.sh                     # Linux/Mac setup script
└── README.md                    # This file
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with the following variables:
# MONGO_URI=mongodb://localhost:27017/food-donation
# JWT_SECRET=your_secret_key
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_app_password
# PORT=5000

# Start the server
npm start
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start

# Application will open at http://localhost:3000
```

## 🔐 User Registration by Role

### Donor (Home)
- Email
- Phone (10 digits)
- Owner Name
- Address
- Password

### Donor (Hostels)
- Email
- Phone (10 digits)
- Hostel Name
- Owner Name
- Address
- Password

### Donor (Restaurants)
- Email
- Phone (10 digits)
- Restaurant Name
- Owner Name
- Address
- Password

### NGO
- Email
- Phone (10 digits)
- First Name
- Last Name
- NGO Name
- NGO Address
- Password

### Volunteer
- Email
- Phone (10 digits)
- First Name
- Last Name
- Password

## 📊 Database Schema

### User Collection
```javascript
{
  uuid: String,
  email: String (unique),
  password_hash: String,
  role: String (DONOR, NGO, VOLUNTEER, ADMIN),
  phone: String (10 digits),
  
  // Donor-specific fields
  donor_type: String (HOME, HOSTELS, RESTAURANTS),
  hostel_name: String,
  restaurant_name: String,
  owner_name: String,
  address: String,
  
  // NGO-specific fields
  ngo_name: String,
  ngo_address: String,
  
  // Points system
  redeemable_points: Number,
  total_points_earned: Number,
  total_points_redeemed: Number,
  
  // System fields
  is_active: Boolean,
  is_verified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Donation Collection
```javascript
{
  uuid: String,
  donor: ObjectId,
  food_type: String,
  quantity: Number,
  unit: String,
  description: String,
  status: String (AVAILABLE, ALLOCATED, PICKED_UP, COMPLETED, CANCELLED),
  
  // NGO acceptance
  accepted_by: {
    user: ObjectId,
    name: String,
    organization: String,
    role: String,
    rejected: Boolean
  },
  
  // Organization
  organization: ObjectId,
  
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Donations
- `POST /api/donations` - Create donation
- `GET /api/donations` - List donations (role-filtered)
- `GET /api/donations/:id` - Get donation details
- `PUT /api/donations/:id/accept` - Accept donation (NGO)
- `PUT /api/donations/:id/reject` - Reject donation (NGO)

### Admin
- `GET /api/admin/ngos` - List all NGOs
- `PUT /api/admin/ngos/:id/approve` - Approve NGO
- `PUT /api/admin/ngos/:id/reject` - Reject NGO
- `GET /api/admin/analytics` - Get system analytics

### Points
- `GET /api/points/balance` - Get user points balance
- `GET /api/points/history` - Get points history
- `POST /api/points/redeem` - Redeem points

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read

## 🔐 Authentication & Authorization

### JWT Token Flow
1. User registers/logs in
2. Backend generates JWT token
3. Token stored in localStorage
4. Token sent in Authorization header for protected routes
5. Middleware verifies token validity

### Role-Based Access Control (RBAC)
- **Public Routes**: Landing, Login, Register, Password Reset
- **Donor Routes**: Dashboard, Create Donation, Points History
- **NGO Routes**: Donation Management, Activity History
- **Volunteer Routes**: Available Donations, Pickup History
- **Admin Routes**: Organization Management, User Analytics, System Control

## 📋 Workflow Examples

### Scenario 1: Home Donor Creates & Tracks Donation
1. Home Donor signs up (Owner Name, Address)
2. Creates donation (Food Type, Quantity, Unit)
3. Donation visible in "Available Donations" tab
4. Can see donation status changes in real-time
5. Earns points when donation is picked up

### Scenario 2: NGO Approves & Distributes Food
1. NGO admin approves registration (after admin approval)
2. Views "Available Donations" from all donors
3. Accepts donations they can fulfill
4. Receives notification when volunteer picks up
5. Marks as completed when distributed

### Scenario 3: Volunteer Coordinates Pickup
1. Volunteer logs in
2. Sees only donations rejected by NGOs
3. Accepts pickup responsibility
4. Updates status to PICKED_UP
5. Marks COMPLETED after distribution
6. Activity logged for audit trail

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Guide](https://jwt.io/introduction)
- [Mongoose ODM](https://mongoosejs.com/)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support & Contact

For support, questions, or feedback, please contact:
- Email: support@fooddonation.com
- Issues: Create a GitHub issue

## 🙏 Acknowledgments

- Food donation initiative supporters
- Open-source community
- Contributors and volunteers

---

**Last Updated**: December 11, 2025  
**Version**: 2.0.0  
**Status**: Production Ready
# Food Donation and Surplus Management System

## Overview
This project aims to reduce food wastage and support hunger reduction by connecting food donors with NGOs and volunteers through a centralized platform.

## Features
- Food donor registration
- NGO and volunteer coordination
- Food listing and request management
- Basic tracking of food distribution

## Sustainability Alignment
- SDG 2: Zero Hunger
- SDG 12: Responsible Consumption and Production

## AI & Future Scope
AI concepts learned during the IBM AI + Sustainability internship (such as IBM Granite models, Retrieval Augmented Generation, and entity extraction) can be integrated in future versions to enhance insights and decision-making.

## Tech Stack
- Developed using VS Code
- Version control with GitHub
