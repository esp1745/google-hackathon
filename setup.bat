@echo off
echo Setting up Creative Storyteller AI...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed. Please install Python 3.8 or higher.
    exit /b 1
)

echo Python found
echo.

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env and add your Google API key!
    echo    Get your key from: https://makersuite.google.com/app/apikey
    echo.
) else (
    echo .env file already exists
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Edit .env and add your GOOGLE_API_KEY
echo 2. Run: venv\Scripts\activate.bat
echo 3. Run: streamlit run app.py
echo.
echo Happy creating!
pause
