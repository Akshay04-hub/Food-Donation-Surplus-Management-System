# Installation and Deployment Guide

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v14.0.0 or higher)
- npm or yarn package manager
- MySQL Server (v5.7 or higher)
- Git

## Quick Start

### Windows Users
1. Double-click `setup.bat` in the project root directory
2. Follow the prompts to install dependencies

### Mac/Linux Users
1. Run `bash setup.sh` in the project root directory
2. Follow the prompts to install dependencies

### Manual Setup

#### Backend Installation
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
mkdir uploads
```

#### Frontend Installation
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed
```

## Configuration

### Backend Configuration (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=food_donation_db

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@fooddonation.com

# Google Maps API (optional)
GOOGLE_MAPS_API_KEY=your_api_key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Database Setup

### Create Database

```bash
# Using MySQL command line
mysql -u root -p < backend/database/schema.sql

# Or manually:
mysql -u root -p
> CREATE DATABASE food_donation_db;
> USE food_donation_db;
> (copy and paste contents of backend/database/schema.sql)
```

## Running the Application

### Development Mode

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm start
# App will start on http://localhost:3000
```

### Production Build

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

## Docker Deployment (Optional)

### Create Dockerfile for Backend

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Create Dockerfile for Frontend

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: food_donation_db
    ports:
      - "3306:3306"
    volumes:
      - ./backend/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  backend:
    build: ./backend
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: root_password
      DB_NAME: food_donation_db
    ports:
      - "5000:5000"
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

Run with: `docker-compose up`

## Deployment to Cloud

### Heroku Deployment

#### Backend
```bash
cd backend
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_key
# Set other environment variables as needed
heroku addons:create cleardb:ignite
git push heroku main
```

#### Frontend
1. Build the frontend: `npm run build`
2. Deploy to Vercel or Netlify using the `build/` folder

### AWS Deployment

#### EC2 Setup
1. Launch Ubuntu EC2 instance
2. Install Node.js and MySQL
3. Clone repository
4. Install dependencies
5. Configure environment variables
6. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "food-donation"
   ```
7. Configure Nginx as reverse proxy

### Google Cloud Run Deployment

```bash
# Build container
docker build -t gcr.io/PROJECT_ID/food-donation-backend .

# Push to Google Container Registry
docker push gcr.io/PROJECT_ID/food-donation-backend

# Deploy
gcloud run deploy food-donation-backend \
  --image gcr.io/PROJECT_ID/food-donation-backend \
  --platform managed \
  --region us-central1
```

## Troubleshooting

### MySQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution**: Ensure MySQL is running
```bash
# Mac
brew services start mysql

# Windows
net start MySQL80

# Linux
sudo systemctl start mysql
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors
Ensure `FRONTEND_URL` in backend `.env` matches your frontend domain

### Database Migration Issues
```bash
# Reset database
mysql -u root -p -e "DROP DATABASE food_donation_db;"
mysql -u root -p < backend/database/schema.sql
```

## Performance Optimization

### Backend
- Enable gzip compression
- Use caching strategies
- Implement database indexing
- Monitor with PM2 monitoring

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Service worker for offline support
- CDN deployment

## Security Checklist

- [ ] Change all default passwords
- [ ] Update JWT_SECRET to a strong value
- [ ] Enable HTTPS in production
- [ ] Configure firewall rules
- [ ] Set up SSL certificate
- [ ] Enable CORS only for trusted domains
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up logging and monitoring

## Monitoring & Logging

### Backend Monitoring
```bash
npm install -g pm2-logs
pm2 monit
```

### Frontend Monitoring
- Use Sentry for error tracking
- Google Analytics for user analytics

## Backup & Recovery

### Database Backup
```bash
mysqldump -u root -p food_donation_db > backup.sql
```

### Database Restore
```bash
mysql -u root -p food_donation_db < backup.sql
```

## Support & Documentation

- GitHub Issues: Report bugs and request features
- Email: support@fooddonation.com
- Documentation: See README.md
- API Docs: Available at /api-docs (after implementation)

---

For additional help, please refer to the main README.md file or create an issue on GitHub.
