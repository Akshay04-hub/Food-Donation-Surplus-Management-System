@echo off
REM Start Backend and Frontend Servers

echo.
echo Starting Food Donation System...
echo ==========================================

REM Start Backend
echo Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm start"

REM Wait a moment for backend to initialize
timeout /t 5 /nobreak >nul

REM Start Frontend
echo Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ==========================================
echo ✓ Servers Starting!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window (servers will keep running)
pause >nul
