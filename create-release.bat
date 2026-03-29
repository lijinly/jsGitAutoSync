@echo off
echo ========================================
echo GitFileSync - Create Release Package
echo ========================================
echo.

REM Set pkg cache path for faster builds
set PKG_CACHE_PATH=C:\pkg-cache
set PKG_VERSION=v3.5
if not exist %PKG_CACHE_PATH% (
    mkdir %PKG_CACHE_PATH%
    echo Created cache directory: %PKG_CACHE_PATH%
)

REM Check Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo Error: Node.js not found!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Installing dependencies...
call npm install
if %errorLevel% neq 0 (
    echo Error: npm install failed!
    pause
    exit /b 1
)
echo.

echo [2/5] Checking Node.js binaries for pkg...
set TARGET_BINARY=fetched-v20.18.2-win-x64
set PKG_CACHE_SUBDIR=%PKG_CACHE_PATH%\%PKG_VERSION%

if not exist %PKG_CACHE_SUBDIR% mkdir %PKG_CACHE_SUBDIR%

REM Check if binary exists in pkg cache subdir
if exist %PKG_CACHE_SUBDIR%\%TARGET_BINARY% (
    echo Binary found in pkg cache: %PKG_CACHE_SUBDIR%\%TARGET_BINARY%
    echo Build will be fast!
) else if exist %PKG_CACHE_PATH%\%TARGET_BINARY% (
    echo Found binary in root cache, copying to pkg subfolder...
    copy %PKG_CACHE_PATH%\%TARGET_BINARY% %PKG_CACHE_SUBDIR%\%TARGET_BINARY% >nul
    echo Binary prepared for pkg.
) else (
    echo Binary not found. Will download during build...
    echo pkg will automatically download the required Node.js binary
    echo This may take 5-10 minutes depending on your internet speed.
    echo.
    echo To manually download, get it from:
    echo https://github.com/yao-pkg/pkg-fetch/releases/download/%PKG_VERSION%/node-v20.18.2-win-x64
    echo And place it at: %PKG_CACHE_SUBDIR%\%TARGET_BINARY%
    echo.
)
echo.

echo [3/5] Building executable...
if exist release rmdir /s /q release
mkdir release

REM Build with pkg (uses cache for fast builds)
npx pkg . --output release/AGitFileSync.exe

if %errorLevel% neq 0 (
    echo Error: Build failed!
    pause
    exit /b 1
)
echo.

echo [4/5] Copying configuration files...
copy .env.example release\.env.example >nul
copy setup.bat release\ >nul
copy uninstall.bat release\ >nul
copy README.md release\ >nul
copy QUICKSTART.md release\ >nul
copy DISTRIBUTION.md release\ >nul
echo.

echo [5/5] Creating logs directory...
mkdir release\logs 2>nul
echo.

echo ========================================
echo Release package created!
echo ========================================
echo.
echo Location: release\
echo.
echo Files:
dir /b release\
echo.
echo To distribute:
echo   1. Zip the release\ folder
echo   2. Share the zip file
echo   3. Users run setup.bat as Administrator
echo.
pause
