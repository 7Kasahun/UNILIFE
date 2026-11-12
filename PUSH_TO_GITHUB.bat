@echo off
title Push UNILIFE to GitHub
cd /d "C:\Users\hp\Desktop\UNILIFE"
echo ======================================================
echo Pushing latest UNILIFE fixes to GitHub...
echo ======================================================
echo.
"C:\Users\hp\AppData\Local\GitHubDesktop\app-3.6.11\resources\app\git\cmd\git.exe" add -A
"C:\Users\hp\AppData\Local\GitHubDesktop\app-3.6.11\resources\app\git\cmd\git.exe" commit -m "fix(github-pages): bundle client storage engine and remove duplicate action workflow" >nul 2>&1
"C:\Users\hp\AppData\Local\GitHubDesktop\app-3.6.11\resources\app\git\cmd\git.exe" push origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ======================================================
    echo SUCCESS! Your changes are now on GitHub.
    echo Please wait 1 minute, then refresh:
    echo https://7kasahun.github.io/UNILIFE/
    echo ======================================================
) else (
    echo.
    echo An error occurred. If a browser window opened, please authorize GitHub.
)
pause
