@echo off
echo ========================================
echo Starting WoodWise ML API
echo ========================================
echo.

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo Error: Python not found. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

echo.
echo Checking dependencies...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
)

echo.
echo Starting Flask API server...
echo API will be available at http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

python app.py

pause
