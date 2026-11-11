@echo off
title UniLife Ethiopia Server
echo ======================================================
echo Starting UniLife Ethiopia Full-Stack Platform...
echo ======================================================
echo.
echo Waiting 2 seconds then launching browser...
timeout /t 2 /nobreak >nul
start http://localhost:5000
echo.
npm start
pause
