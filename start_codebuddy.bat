@echo off
title CodeBuddy Platform Launcher
echo ========================================================
echo         Launching CodeBuddy Full-Stack Platform
echo ========================================================
echo.

:: Start Flask Backend in background
start "CodeBuddy Backend" /min cmd /c "python backend\run.py"

:: Start Vite Frontend in background
start "CodeBuddy Frontend" /min cmd /c "cd frontend && npm run dev"

:: Wait 3 seconds for servers to initialize
timeout /t 3 /nobreak >nul

:: Open default web browser
echo Opening CodeBuddy in your browser...
start http://localhost:5173

echo.
echo ========================================================
echo   CodeBuddy is LIVE:
echo   - Web App:     http://localhost:5173
echo   - Backend API: http://localhost:5000/api
echo ========================================================
echo.
