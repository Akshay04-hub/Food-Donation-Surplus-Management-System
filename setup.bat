@echo off
REM Food Donation System - Setup Script for Windows

echo.
echo 🍽️  Food Donation System - Initial Setup
echo ==========================================

REM Backend Setup
echo.
echo Setting up Backend...
cd backend

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
) else (
    echo Backend dependencies already installed
)

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please update backend\.env with your configuration
) else (
    echo .env file already exists
)

REM Create uploads directory
if not exist "uploads" mkdir uploads

echo ✓ Backend setup complete

REM Frontend Setup
cd ..\frontend

if not exist "node_modules" (
    echo.
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies already installed
)

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo ✓ Frontend .env created
) else (
    echo .env file already exists
)

echo.
echo ==========================================
echo ✓ Setup Complete!
echo.
echo Next steps:
echo 1. Configure backend\.env with your database and email settings
echo 2. Create MySQL database using database\schema.sql
echo 3. Start backend: cd backend ^&^& npm run dev
echo 4. Start frontend: cd frontend ^&^& npm start
echo.
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.
pause
