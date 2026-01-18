# Food Donation and Surplus Management System

A complete full-stack web application for managing food donations from donors to receivers, including organizations, pickup management, ratings, and comprehensive analytics.

![Food Donation System](https://img.shields.io/badge/Status-Active-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-v18-green)
![React](https://img.shields.io/badge/React-v18-blue)
![MySQL](https://img.shields.io/badge/MySQL-v5.7+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [User Roles & Permissions](#user-roles--permissions)
- [Security Features](#security-features)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [Support](#support)

## 🌟 Features

### Core Features

1. **User Authentication & Authorization**
   - Secure JWT-based authentication
   - Role-based access control (4 roles)
   - Email verification
   - Password hashing with bcryptjs

2. **Donation Management**
   - Create and list food donations
   - Real-time donation status tracking
   - Location-based search (10km radius by default)
   - Expiry date validation
   - Food category classification
   - Donation statistics and analytics

3. **Pickup Request System**
   - Request pickup for available donations
   - Confirm, reject, or cancel requests
   - Track pickup status
   - Automatic availability management

4. **Organization Management**
   - Register NGOs, charities, and restaurants
   - Organization verification workflow
   - Admin approval process
   - Organization-specific analytics

5. **Messaging System**
   - User-to-user communication
   - Real-time message notifications
   - Message history and threads
   - Unread message tracking

6. **Notification System**
   - 8 different notification types
   - Read/unread status management
   - Automatic email notifications
   - In-app notification display

7. **Rating & Review System**
   - 1-5 star rating scale
   - User reviews and feedback
   - Average rating calculation
   - Transaction-based ratings

8. **Admin Dashboard**
   - Comprehensive statistics
   - Top donors leaderboard
   - Food category distribution
   - City-wise analytics
   - Organization approval management

### Security Features

- JWT token-based authentication (7-day expiration)
- Password hashing with bcryptjs (10 salt rounds)
- SQL injection prevention via Sequelize ORM
- XSS protection with input sanitization
- CORS configuration for cross-origin requests
- Rate limiting (100 requests/15 minutes per IP)
- Express Helmet for security headers
- Input validation on all endpoints
- Audit logging for sensitive operations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Port 3000)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Pages: Login, Register, Donations, Organizations    │  │
│  │ Components: Navbar, ProtectedRoute, Cards, Forms    │  │
│  │ Services: API Client with Interceptors              │  │
│  │ Styling: Bootstrap + Custom CSS                     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │ REST API + JSON
┌────────────────────────▼─────────────────────────────────────┐
│              Express.js Backend (Port 5000)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Controllers: Auth, Donations, Pickups, Messages,    │  │
│  │             Organizations, Ratings, Analytics       │  │
│  │ Routes: /auth, /donations, /pickups, /messages      │  │
│  │ Middleware: Auth, RoleCheck, Validation, ErrorHandle│  │
│  │ Utilities: JWT, Password Hashing, Email Utils       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │ SQL Queries
┌────────────────────────▼─────────────────────────────────────┐
│              MySQL Database (Port 3306)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tables: users, donations, pickups, messages,         │  │
│  │         notifications, ratings, organizations,       │  │
│  │         analytics, audit_logs, etc.                  │  │
│  │ Relationships: Foreign keys, Indexes, Constraints    │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js v4.18
- **Database**: MySQL v5.7+ with Sequelize ORM v6.35
- **Authentication**: JWT (jsonwebtoken v9.1)
- **Security**: bcryptjs v2.4, Helmet v7.1, CORS v2.8
- **Email**: Nodemailer v6.9
- **File Upload**: Multer v1.4
- **Real-time**: Socket.io v4.7
- **Validation**: express-validator v7.0
- **Rate Limiting**: express-rate-limit v7.1

### Frontend
- **Library**: React v18.2
- **Routing**: React Router DOM v6.16
- **HTTP Client**: Axios v1.6 with interceptors
- **UI Framework**: Bootstrap v5.3 + React-Bootstrap v2.9
- **Real-time**: Socket.io-client v4.7
- **Notifications**: React-Toastify v9.1
- **JWT Parsing**: jwt-decode v4.0
- **Mapping**: React Leaflet v4.2 (for future implementation)
- **Styling**: Custom CSS + Bootstrap

### Development Tools
- **Dev Server**: Nodemon v3.0 (backend), Create React App (frontend)
- **Testing**: Jest (configured, not yet implemented)
- **Linting**: ESLint (configured, not yet implemented)
- **Package Manager**: npm v10+

## 📁 Project Structure

```
food-donation-system/
├── backend/
│   ├── config/
│   │   ├── database.js          # Sequelize configuration
│   │   └── email.js             # Email service configuration
│   ├── database/
│   │   └── schema.sql           # Complete MySQL schema
│   ├── models/
│   │   ├── User.js              # User model with authentication
│   │   ├── Organization.js      # Organization/NGO model
│   │   ├── Donation.js          # Donation listing model
│   │   ├── PickupRequest.js     # Pickup request model
│   │   ├── Notification.js      # Notification model
│   │   ├── Message.js           # Message model
│   │   ├── Rating.js            # Rating/Review model
│   │   └── Analytics.js         # Analytics aggregation model
│   ├── controllers/
│   │   ├── authController.js    # Auth logic (register, login)
│   │   ├── donationController.js # Donation CRUD operations
│   │   ├── pickupRequestController.js # Pickup management
│   │   ├── organizationController.js  # Organization management
│   │   ├── messageController.js  # Message operations
│   │   ├── notificationController.js  # Notification management
│   │   ├── ratingController.js   # Rating CRUD
│   │   └── analyticsController.js    # Analytics queries
│   ├── routes/
│   │   ├── authRoutes.js        # /auth endpoints
│   │   ├── donationRoutes.js    # /donations endpoints
│   │   ├── pickupRoutes.js      # /pickups endpoints
│   │   ├── organizationRoutes.js # /organizations endpoints
│   │   ├── messageRoutes.js     # /messages endpoints
│   │   ├── notificationRoutes.js # /notifications endpoints
│   │   ├── ratingRoutes.js      # /ratings endpoints
│   │   └── analyticsRoutes.js   # /analytics endpoints
│   ├── middleware/
│   │   ├── auth.js              # JWT verification middleware
│   │   ├── roleCheck.js         # Role-based access control
│   │   ├── validation.js        # Input validation middleware
│   │   ├── errorHandler.js      # Global error handler
│   │   └── auditLog.js          # Audit logging middleware
│   ├── utils/
│   │   ├── jwtUtils.js          # JWT token operations
│   │   ├── passwordUtils.js     # Password hashing/verification
│   │   └── emailUtils.js        # Email sending utilities
│   ├── uploads/                 # User uploaded files
│   ├── .env.example             # Environment variables template
│   ├── server.js                # Express application entry point
│   ├── package.json             # Dependencies and scripts
│   └── package-lock.json        # Locked dependency versions
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js        # Navigation bar component
│   │   │   └── ProtectedRoute.js # Auth protection wrapper
│   │   ├── pages/
│   │   │   ├── LoginPage.js     # User login page
│   │   │   ├── RegisterPage.js  # User registration page
│   │   │   ├── DonationListPage.js # Browse donations
│   │   │   ├── DonationDetailPage.js # Donation details
│   │   │   ├── CreateDonationPage.js # Create new donation
│   │   │   ├── OrganizationPage.js # Browse organizations
│   │   │   ├── DashboardPage.js # User dashboard
│   │   │   ├── AdminDashboardPage.js # Admin analytics
│   │   │   ├── ProfilePage.js   # User profile management
│   │   │   ├── NotificationsPage.js # Notifications list
│   │   │   └── MessagesPage.js  # Messaging interface
│   │   ├── services/
│   │   │   └── api.js           # Centralized API client
│   │   ├── styles/
│   │   │   ├── App.css          # Main app styling
│   │   │   ├── Auth.css         # Authentication pages
│   │   │   ├── Navbar.css       # Navigation styling
│   │   │   ├── Donations.css    # Donation pages
│   │   │   ├── Form.css         # Form styling
│   │   │   ├── Notifications.css # Notification styling
│   │   │   ├── Dashboard.css    # Dashboard styling
│   │   │   ├── Messages.css     # Messaging styling
│   │   │   ├── Details.css      # Detail pages
│   │   │   ├── Organizations.css # Organization styling
│   │   │   └── Admin.css        # Admin dashboard styling
│   │   ├── App.js               # Main routing component
│   │   ├── App.test.js          # App component tests
│   │   ├── index.js             # React entry point
│   │   └── index.css            # Global styles
│   ├── public/
│   │   ├── index.html           # HTML entry point
│   │   ├── favicon.ico          # Site icon
│   │   └── manifest.json        # PWA manifest
│   ├── .env.example             # Environment variables template
│   ├── package.json             # Dependencies and scripts
│   ├── package-lock.json        # Locked dependency versions
│   └── README.md                # Frontend documentation
│
├── .gitignore                   # Git ignore rules
├── package.json                 # Root package for scripts
├── README.md                    # Main documentation (this file)
├── DEPLOYMENT.md                # Deployment guide
├── setup.sh                     # Linux/Mac setup script
└── setup.bat                    # Windows setup script
```

## 🚀 Installation

### Prerequisites

Ensure you have installed:
- **Node.js** v14.0.0 or higher
- **npm** v6.0.0 or higher
- **MySQL** v5.7 or higher
- **Git** (optional, for version control)

### Quick Start (Automated)

#### Windows
Double-click `setup.bat` in the project root directory and follow the prompts.

#### Mac/Linux
```bash
bash setup.sh
```

### Manual Installation

#### Step 1: Clone or Extract Project
```bash
cd mini-project-2
```

#### Step 2: Backend Installation
```bash
cd backend
npm install
cp .env.example .env
mkdir uploads
```

#### Step 3: Frontend Installation
```bash
cd ../frontend
npm install
cp .env.example .env
```

#### Step 4: Database Setup
```bash
# Using MySQL CLI
mysql -u root -p < ../backend/database/schema.sql

# Or create database manually
mysql -u root -p
> CREATE DATABASE food_donation_db CHARACTER SET utf8mb4;
> USE food_donation_db;
> (paste contents of backend/database/schema.sql)
```

## ⚙️ Configuration

### Backend Configuration

Edit `backend/.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=food_donation_db

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_very_long_secret_key_change_this_in_production_1234567890
JWT_EXPIRE=7d

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM=noreply@fooddonation.com

# Optional Services
GOOGLE_MAPS_API_KEY=your_api_key_here

# File Upload
MAX_FILE_SIZE=5MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif

# Frontend
FRONTEND_URL=http://localhost:3000
```

**Note**: For Gmail, use [App Passwords](https://myaccount.google.com/apppasswords)

### Frontend Configuration

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🏃 Running the Application

### Development Mode

#### Option 1: Concurrent (Recommended)
```bash
npm run dev
# Runs both backend and frontend simultaneously
```

#### Option 2: Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

### Production Mode

#### Backend
```bash
cd backend
npm install
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run build
npm install -g serve
serve -s build
```

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | ✗ |
| POST | `/login` | User login | ✗ |
| GET | `/me` | Get current user | ✓ |
| PUT | `/profile` | Update profile | ✓ |

### Donations (`/api/donations`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/` | Create donation | ✓ | DONOR |
| GET | `/` | List donations | ✗ | - |
| GET | `/:id` | Get donation details | ✗ | - |
| PUT | `/:id` | Update donation | ✓ | DONOR |
| DELETE | `/:id` | Cancel donation | ✓ | DONOR |

### Pickup Requests (`/api/pickups`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/` | Create pickup request | ✓ | RECEIVER |
| GET | `/` | List requests | ✓ | - |
| GET | `/:id` | Get request details | ✓ | - |
| PUT | `/:id/confirm` | Confirm request | ✓ | DONOR |
| PUT | `/:id/reject` | Reject request | ✓ | DONOR |
| PUT | `/:id/picked-up` | Mark as picked up | ✓ | DONOR |

### Organizations (`/api/organizations`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/` | Create organization | ✓ | Any |
| GET | `/` | List organizations | ✗ | - |
| GET | `/:id` | Get organization | ✗ | - |
| PUT | `/:id` | Update organization | ✓ | Creator/Admin |
| PUT | `/:id/approve` | Approve org | ✓ | ADMIN |
| PUT | `/:id/reject` | Reject org | ✓ | ADMIN |

### Messages (`/api/messages`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Send message | ✓ |
| GET | `/thread/:userId` | Get message thread | ✓ |
| GET | `/conversations` | Get all conversations | ✓ |
| GET | `/unread-count` | Get unread count | ✓ |

### Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get notifications | ✓ |
| PUT | `/:id/read` | Mark as read | ✓ |
| PUT | `/read-all` | Mark all as read | ✓ |
| GET | `/unread-count` | Get unread count | ✓ |

### Ratings (`/api/ratings`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create rating | ✓ |
| GET | `/user/:userId` | Get user ratings | ✗ |
| GET | `/user/:userId/average` | Get average rating | ✗ |
| PUT | `/:id` | Update rating | ✓ |

### Analytics (`/api/analytics`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/dashboard` | Dashboard stats | ✓ | Any |
| GET | `/date-range` | Stats by date range | ✓ | ADMIN |
| GET | `/top-donors` | Top donors list | ✓ | ADMIN |
| GET | `/food-distribution` | Food categories | ✓ | ADMIN |
| GET | `/city-stats` | City-wise stats | ✓ | ADMIN |

## 📊 Database Schema

### User Table
Stores user authentication and profile information.

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('DONOR', 'RECEIVER', 'ADMIN', 'VERIFIED_VOLUNTEER'),
  profile_picture_url VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  bio TEXT,
  verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED'),
  email_verified_at DATETIME,
  phone_verified_at DATETIME,
  document_url VARCHAR(255),
  rating_count INT DEFAULT 0,
  average_rating DECIMAL(2, 1) DEFAULT 0,
  donation_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Donation Table
Stores food donation listings.

```sql
CREATE TABLE donations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  donor_id INT NOT NULL,
  food_type VARCHAR(100) NOT NULL,
  food_category ENUM('FRUITS', 'VEGETABLES', 'DAIRY', 'BAKERY', 'COOKED_MEAL', 'PACKAGED', 'OTHERS'),
  description TEXT,
  quantity_value DECIMAL(10, 2) NOT NULL,
  quantity_unit ENUM('KG', 'LITERS', 'PIECES', 'SERVINGS'),
  storage_type ENUM('ROOM_TEMP', 'REFRIGERATED', 'FROZEN'),
  preparation_date DATETIME NOT NULL,
  expiry_date DATETIME NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  zip_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  image_url VARCHAR(255),
  availability_count INT NOT NULL DEFAULT 1,
  status ENUM('AVAILABLE', 'REQUESTED', 'ALLOCATED', 'PICKED_UP', 'COMPLETED', 'CANCELLED'),
  is_verified BOOLEAN DEFAULT FALSE,
  pickup_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### PickupRequest Table
Tracks pickup requests for donations.

```sql
CREATE TABLE pickup_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  donation_id INT NOT NULL,
  receiver_id INT NOT NULL,
  requested_quantity DECIMAL(10, 2) NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'PICKED_UP', 'CANCELLED', 'REJECTED'),
  pickup_datetime DATETIME,
  completed_at DATETIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Additional Tables**: Organizations, Messages, Notifications, Ratings, Analytics, AuditLogs, VerificationTokens

For complete schema, see `backend/database/schema.sql`

## 👥 User Roles & Permissions

| Role | Capabilities |
|------|--------------|
| **DONOR** | Create donations, manage own donations, receive requests, rate receivers |
| **RECEIVER** | Search donations, request pickups, message donors, rate donors |
| **ADMIN** | Manage users, approve organizations, view analytics, manage reports |
| **VERIFIED_VOLUNTEER** | Assist in pickups, track deliveries, support operations |

## 🔒 Security Features

✓ JWT-based stateless authentication (7-day tokens)
✓ Password hashing with bcryptjs (10 salt rounds)
✓ SQL injection prevention through Sequelize ORM
✓ XSS protection via input sanitization
✓ CSRF tokens on sensitive operations
✓ Rate limiting (100 req/15min per IP)
✓ CORS configuration for trusted domains
✓ Security headers (Helmet.js)
✓ Audit logging for sensitive operations
✓ Input validation on all endpoints
✓ Secure file upload with type restrictions
✓ Error message obfuscation in production

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:**
```bash
# Check MySQL status
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # Mac
# Start MySQL if stopped
sudo systemctl start mysql   # Linux
brew services start mysql    # Mac
```

#### 2. Port Already in Use
```bash
# Find process on port 5000
lsof -i :5000
# Kill process
kill -9 <PID>
```

#### 3. Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 4. CORS Errors
Ensure `FRONTEND_URL` in `backend/.env` matches your frontend domain:
```env
FRONTEND_URL=http://localhost:3000
```

#### 5. Email Not Sending
- Verify Gmail credentials in `.env`
- Enable [2FA and generate App Password](https://myaccount.google.com/apppasswords)
- Check SMTP settings

## 📦 Deployment

See `DEPLOYMENT.md` for comprehensive deployment guides for:
- Heroku
- AWS EC2
- Google Cloud Run
- Docker & Docker Compose
- Traditional VPS

## 🔮 Future Enhancements

1. **Google Maps Integration**
   - Real-time location tracking
   - Interactive map with donation markers
   - Distance-based filtering visualization

2. **Real-time Features**
   - WebSocket integration with Socket.io
   - Live notifications
   - Real-time chat
   - Live pickup status updates

3. **Advanced Analytics**
   - Historical data visualization (charts/graphs)
   - Predictive analytics for demand
   - Impact reporting and metrics

4. **Mobile Applications**
   - React Native mobile app
   - Push notifications
   - Offline capability

5. **AI/ML Features**
   - Donation recommendation engine
   - Smart matching between donors and receivers
   - Fraud detection
   - Natural language processing for descriptions

6. **Payment Integration**
   - Subscription plans for organizations
   - Donation incentives (tax deduction certs)
   - Paid features

7. **Advanced Security**
   - Two-factor authentication (2FA)
   - Biometric authentication
   - Zero-knowledge encryption

8. **Internationalization**
   - Multi-language support
   - Multi-currency support
   - Localization for different regions

9. **Community Features**
   - Social sharing
   - Gamification (badges, leaderboards)
   - Volunteer coordination

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: support@fooddonation.com
- **Documentation**: See README.md and DEPLOYMENT.md

## 👨‍💼 Authors

- **Lead Developer**: Your Name
- **Contributors**: List of contributors

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Production Ready ✓

For detailed installation and deployment instructions, see `DEPLOYMENT.md`.

**Happy Donating! 🍽️**
