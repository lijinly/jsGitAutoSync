@echo off
echo ========================================
echo GitFileSync - Build Executable
echo ========================================
echo.

REM Check for admin rights (not required for build, but good practice)
echo [1/4] Checking environment...

REM Check Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo Error: Node.js not found!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check pkg
echo [2/4] Checking pkg...
npx pkg --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Installing pkg...
    npm install -g pkg
)
echo.

REM Clean and create release directory
echo [3/4] Preparing release directory...
if exist release rmdir /s /q release
mkdir release
echo.

REM Build executable
echo [4/4] Building executable with pkg...
npx pkg . --targets node18-win-x64 --output release/AGitFileSync.exe

if %errorLevel% neq 0 (
    echo.
    echo Build failed!
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build successful!
echo ========================================
echo.
echo Output: release\AGitFileSync.exe
echo.
pause
