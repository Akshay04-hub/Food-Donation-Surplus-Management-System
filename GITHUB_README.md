<!-- 
  Food Donation System - GitHub README
  This file will be displayed as the main project documentation on GitHub
-->

# 🍽️ Food Donation and Surplus Management System

[![GitHub License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7+-blue.svg)](https://www.mysql.com/)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)](#)

A comprehensive full-stack web application for managing food donations from donors to receivers, featuring real-time notifications, pickup management, organization verification, ratings system, and comprehensive analytics dashboard.

## 🌟 Key Highlights

- ✅ **Complete Full-Stack Application** - Production-ready code for both frontend and backend
- ✅ **Secure Authentication** - JWT-based authentication with role-based access control
- ✅ **Real-Time Features** - Notifications, messaging, and status updates
- ✅ **Location-Based Search** - Find donations within 10km radius using GPS
- ✅ **Admin Dashboard** - Comprehensive analytics and organization management
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile devices
- ✅ **Docker Ready** - Containerized deployment with docker-compose
- ✅ **Well-Documented** - Comprehensive README and deployment guides

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- npm v6+
- MySQL v5.7+

### Installation (30 seconds)

#### Windows
```bash
setup.bat
```

#### Mac/Linux
```bash
bash setup.sh
```

#### Manual
```bash
npm run install-all
mysql -u root -p < backend/database/schema.sql
```

### Running

```bash
# Development mode (runs both backend and frontend)
npm run dev

# Or in separate terminals:
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start
```

Access the application at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000/api

## 📋 Features

### For Donors
- Register as food donor (individuals, restaurants, NGOs)
- Create donation listings with images and expiry dates
- Track pickup requests in real-time
- Rate receivers after successful pickups
- View donation statistics and impact

### For Receivers
- Browse available food donations
- Filter by location (10km radius), category, and status
- Request pickups with quantity selection
- Message donors directly
- Rate donors and leave reviews

### For Organizations
- Register as NGO, charity, or restaurant
- Admin approval workflow for verification
- Organization-specific analytics
- Bulk donation management
- Team member management

### For Admins
- Dashboard with comprehensive statistics
- Donation and pickup management
- Organization approval/rejection
- User analytics and reports
- Top donors leaderboard
- City-wise distribution analysis

## 🛠️ Technology Stack

### Backend
- **Express.js** - Node.js web framework
- **MySQL** - Relational database
- **Sequelize** - ORM for database management
- **JWT** - Stateless authentication
- **Bcryptjs** - Password hashing
- **Nodemailer** - Email notifications
- **Socket.io** - Real-time features
- **Multer** - File upload handling
- **Helmet** - Security headers
- **Express-rate-limit** - Rate limiting

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Bootstrap** - UI framework
- **React-Toastify** - Notifications
- **Socket.io-client** - Real-time updates
- **React Leaflet** - Mapping (future use)

## 📁 Project Structure

```
food-donation-system/
├── backend/              # Express.js backend
│   ├── config/          # Database & email config
│   ├── models/          # Sequelize models
│   ├── controllers/     # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation, error handling
│   ├── utils/           # Utility functions
│   └── database/        # SQL schema
├── frontend/            # React frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   ├── services/   # API client
│   │   └── styles/     # CSS files
│   └── public/         # Static files
├── DEPLOYMENT.md       # Deployment guide
├── QUICKSTART.md       # Quick start guide
└── README.md           # This file
```

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Complete feature list and architecture
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Installation, configuration, and deployment guides
- **API Documentation** - See QUICKSTART.md for all endpoints
- **Database Schema** - See backend/database/schema.sql

## 🔒 Security Features

- ✓ JWT token-based authentication (7-day expiration)
- ✓ bcryptjs password hashing (10 salt rounds)
- ✓ SQL injection prevention (Sequelize ORM)
- ✓ XSS protection (input sanitization)
- ✓ CORS configuration
- ✓ Rate limiting (100 req/15min per IP)
- ✓ Helmet security headers
- ✓ Audit logging
- ✓ Input validation

## 📡 API Endpoints (Sample)

```
POST   /api/auth/register              # Register user
POST   /api/auth/login                 # Login user
GET    /api/donations                  # List donations
POST   /api/donations                  # Create donation (DONOR only)
POST   /api/pickups                    # Request pickup (RECEIVER only)
PUT    /api/pickups/:id/confirm        # Confirm pickup (DONOR only)
GET    /api/organizations              # List organizations
GET    /api/notifications              # Get notifications
POST   /api/messages                   # Send message
POST   /api/ratings                    # Create rating
GET    /api/analytics/dashboard        # Dashboard stats
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete API documentation.

## 🐳 Docker Deployment

```bash
docker-compose up
```

Includes:
- MySQL database
- Node.js backend
- React frontend

## ☁️ Cloud Deployment

**Heroku**:
```bash
cd backend && heroku create your-app-name && git push heroku main
```

**AWS/Google Cloud**: See [DEPLOYMENT.md](DEPLOYMENT.md)

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 🐛 Troubleshooting

**MySQL Connection Error**:
```bash
brew services start mysql  # Mac
sudo systemctl start mysql # Linux
```

**Port 5000 Already in Use**:
```bash
lsof -i :5000
kill -9 <PID>
```

**CORS Errors**: Ensure `FRONTEND_URL` in `.env` matches your frontend URL

See [DEPLOYMENT.md](DEPLOYMENT.md) for more troubleshooting tips.

## 🔮 Future Enhancements

- 📍 Real-time GPS tracking
- 🗺️ Interactive map visualization
- 📱 Mobile apps (React Native)
- 🤖 AI-powered matching algorithm
- 📊 Advanced analytics with charts
- 🔐 Two-factor authentication
- 🌍 Multi-language support
- 🎮 Gamification (badges, leaderboards)

## 📊 Project Statistics

- **Backend**: 25+ files, 4000+ lines of code
- **Frontend**: 30+ files, 3000+ lines of code
- **Database**: 13 tables with relationships
- **API Endpoints**: 24+ RESTful endpoints
- **Test Coverage**: Configuration ready

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **DONOR** | Create donations, manage listings, receive requests |
| **RECEIVER** | Search donations, request pickups, message users |
| **ADMIN** | User management, organization approval, analytics |
| **VERIFIED_VOLUNTEER** | Assist pickups, track deliveries |

## 💡 Use Cases

1. **Individual Donors** - Share excess food from home
2. **Restaurants** - Donate daily unsold meals
3. **Grocery Stores** - Donate near-expiry items
4. **NGOs/Charities** - Coordinate food distribution
5. **Community Groups** - Organize local food banks

## 📈 Impact Metrics

The system tracks:
- Total food donations
- Quantity donated (in KG)
- Number of people helped
- Active donors and receivers
- Average user ratings
- City-wise distribution
- Category-wise breakdown

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🎓 Learning Resources

This project demonstrates:
- Full-stack application development
- RESTful API design
- Database design and relationships
- Authentication & authorization
- Real-time features
- Error handling & validation
- Security best practices
- Responsive web design

## 💬 Support

- **Issues**: [GitHub Issues](../../issues)
- **Email**: support@fooddonation.com
- **Docs**: See DEPLOYMENT.md for detailed guides

## 🙏 Acknowledgments

Built with:
- Express.js and React.js communities
- Open-source security libraries
- Bootstrap framework
- MySQL database

---

**Made with ❤️ for the community**

Started: January 2025 | Status: Production Ready ✓

**[Get Started Now →](DEPLOYMENT.md)**
