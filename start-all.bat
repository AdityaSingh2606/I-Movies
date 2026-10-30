@echo off
title IMovies Cinema Management System
cd /d "%~dp0"

echo ========================================================
echo       IMOVIES - FULL-STACK CINEMA BOOKING SYSTEM
echo ========================================================
echo.
echo [1/3] Starting Backend API Server (Port 5000)...
start "IMovies Server (Backend)" cmd /k "cd /d ""%~dp0server"" && npm run dev"

echo [2/3] Starting Frontend Client (Port 3000)...
start "IMovies Client (Frontend)" cmd /k "cd /d ""%~dp0client"" && npm run dev"

echo.
echo [3/3] Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================================
echo   Application is LIVE!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo.
echo   Demo Login Accounts:
echo   1. Customer Account:
echo      Email:    user@imovies.com
echo      Password: User@123
echo.
echo   2. Admin Account:
echo      Email:    admin@imovies.com
echo      Password: Admin@123
echo ========================================================
pause
