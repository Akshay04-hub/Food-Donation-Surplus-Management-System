#!/bin/bash

# Food Donation System - Setup Script for Unix/Linux/Mac

echo "🍽️  Food Donation System - Initial Setup"
echo "=========================================="

# Backend Setup
echo ""
echo "Setting up Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "Backend dependencies already installed"
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your configuration"
else
    echo ".env file already exists"
fi

# Create uploads directory
mkdir -p uploads

echo "✓ Backend setup complete"

# Frontend Setup
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo ""
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed"
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ Frontend .env created"
else
    echo ".env file already exists"
fi

echo ""
echo "=========================================="
echo "✓ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Configure backend/.env with your database and email settings"
echo "2. Create MySQL database: mysql -u root -p < ../backend/database/schema.sql"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm start"
echo ""
echo "Backend will run on http://localhost:5000"
echo "Frontend will run on http://localhost:3000"
