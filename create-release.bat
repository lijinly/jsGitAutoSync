@echo off
echo ========================================
echo GitFileSync - Create Release Package
echo ========================================
echo.

REM Set pkg cache path for faster builds
set PKG_CACHE_PATH=C:\pkg-cache
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
set NODE_BINARY=fetched-v18.15.0-win-x64
set DOWNLOAD_URL=https://github.com/vercel/pkg-fetch/releases/download/v3.5/node-v18.15.0-win-x64

if exist %PKG_CACHE_PATH%\%NODE_BINARY% (
    echo Binary found in cache. Build will be fast!
) else if exist .\pkg-cache\%NODE_BINARY% (
    echo Found local binary, copying to cache...
    if not exist %PKG_CACHE_PATH% mkdir %PKG_CACHE_PATH%
    copy .\pkg-cache\%NODE_BINARY% %PKG_CACHE_PATH%\%NODE_BINARY% >nul
    echo Local binary copied to cache.
) else (
    echo Binary not found. Downloading from GitHub... (one-time only)
    echo URL: %DOWNLOAD_URL%
    echo This may take 5-10 minutes depending on your internet speed.
    echo.
    powershell -Command "& {$url='%DOWNLOAD_URL%'; $out='%PKG_CACHE_PATH%\%NODE_BINARY%'; try { Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing; Write-Host 'Download complete!'} catch { Write-Host 'Download failed: ' $_.Exception.Message; exit 1 }}"
    if %errorLevel% neq 0 (
        echo.
        echo Error: Download failed!
        echo Please manually download from: %DOWNLOAD_URL%
        echo And place it at: %PKG_CACHE_PATH%\%NODE_BINARY%
        pause
        exit /b 1
    )
    echo Download complete!
)
echo.

echo [3/5] Building executable...
if exist release rmdir /s /q release
mkdir release

REM Build with pkg (uses cache for fast builds)
npx pkg . --targets node18.15.0-win-x64 --output release/AGitFileSync.exe

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
