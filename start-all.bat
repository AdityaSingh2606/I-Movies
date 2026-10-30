@echo off
title IMovies Cinema Management System
echo ========================================================
echo       IMOVIES - FULL-STACK CINEMA BOOKING SYSTEM
echo ========================================================
echo.
echo [1/2] Starting Backend API Server (Port 5000)...
start "IMovies Server" cmd /k "cd server && npm run dev"

echo [2/2] Starting Frontend Client (Port 3000)...
start "IMovies Client" cmd /k "cd client && npm run dev"

echo.
echo ========================================================
echo   Application is launching!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo   Admin:    admin@imovies.com / Admin@123
echo   User:     user@imovies.com  / User@123
echo ========================================================
pause
