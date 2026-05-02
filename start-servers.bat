@echo off
echo ========================================
echo Starting WoodWise Application
echo ========================================
echo.
echo Starting Next.js Dev Server...
start "Next.js Dev Server" cmd /k "npm run dev"
echo.
echo Waiting 5 seconds...
timeout /t 5 /nobreak >nul
echo.
echo Starting Python ML Server...
start "Python ML Server" cmd /k "cd app/api/wood-classifier && python app.py"
echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Next.js:  http://localhost:3000
echo ML API:   http://localhost:5000
echo.
echo Press any key to exit this window...
pause >nul
