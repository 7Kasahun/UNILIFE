@echo off
title UniLife Ethiopia Development Mode
echo ======================================================
echo Starting UniLife Ethiopia (Vite + Express Dev Mode)...
echo ======================================================
echo.
timeout /t 2 /nobreak >nul
start http://localhost:5173
echo.
npm run dev:all
pause
