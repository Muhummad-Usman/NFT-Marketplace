@echo off
title NFT Marketplace Startup

echo 🚀 Starting NFT Marketplace Project
echo ==================================

REM Check if we're in the right directory
if not exist "backend" (
    echo ❌ Error: backend directory not found
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Error: frontend directory not found
    pause
    exit /b 1
)

echo 📦 Step 1: Starting Backend Server...
cd backend

REM Install backend dependencies if needed
if not exist "node_modules" (
    echo 📥 Installing backend dependencies...
    npm install
)

REM Start backend server
echo 🔧 Starting backend server...
start "Backend Server" cmd /k "npm run server"

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo ✅ Backend server started

echo 📦 Step 2: Starting Frontend...
cd ..\frontend

REM Install frontend dependencies if needed
if not exist "node_modules" (
    echo 📥 Installing frontend dependencies...
    npm install
)

REM Start frontend
echo 🎨 Starting frontend application...
start "Frontend App" cmd /k "npm start"

echo ✅ Frontend started
echo.
echo 🌐 Application URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001
echo.
echo 🔧 To stop the application, close the terminal windows
echo.
echo ⏳ Waiting for applications to fully start...
timeout /t 10 /nobreak > nul

echo 🎉 NFT Marketplace is ready!
echo 📱 Open your browser and go to: http://localhost:3000
echo.

pause
