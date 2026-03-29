# GitFileSync - Simple Distribution Script
# Creates a ready-to-distribute package

Write-Host "===== GitFileSync Distribution Builder =====" -ForegroundColor Cyan
$ErrorActionPreference = "Stop"

# Configuration
$DIST_DIR = "release"
$APP_NAME = "GitFileSync"
$VERSION = "1.0.0"

Write-Host "`n[Step 1/3] Preparing distribution directory..." -ForegroundColor Yellow
if (Test-Path $DIST_DIR) {
    Remove-Item -Recurse -Force $DIST_DIR
}
New-Item -ItemType Directory -Path $DIST_DIR | Out-Null

Write-Host "`n[Step 2/3] Installing production dependencies..." -ForegroundColor Yellow
npm ci --production

Write-Host "`n[Step 3/3] Copying files to distribution folder..." -ForegroundColor Yellow

# Copy application files
$filesToCopy = @(
    "package.json",
    "package-lock.json",
    ".env.example",
    "README.md",
    "src"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Write-Host "  Copying $file..." -ForegroundColor Gray
        Copy-Item -Path $file -Destination "$DIST_DIR\$file" -Recurse -Force
    }
}

# Create .env template
$envTemplate = @"
# ========================================
# GitFileSync Configuration
# ========================================

# GitHub Personal Access Token
# Create one at: https://github.com/settings/tokens
# Required scopes: repo
GITHUB_PAT=your_token_here

# GitHub Repository URL
# Format: https://YOUR_TOKEN@github.com/USERNAME/REPO.git
REPO_URL=https://your_token_here@github.com/username/repo.git

# Branch to sync
BRANCH=main

# Local directory for file sync
SYNC_DIR=C:\Users\$env:USERNAME\GitSync

# Sync interval in seconds (default: 30)
PULL_INTERVAL=30

# PC name (for multi-PC sync)
PC_NAME=$env:COMPUTERNAME

# Git configuration
GIT_USER_NAME=GitFileSync
GIT_USER_EMAIL=gitfilesync@localhost
"@

Set-Content "$DIST_DIR\.env" -Value $envTemplate
Write-Host "  Created .env template" -ForegroundColor Gray

# Create installer script
$installerScript = @"
@echo off
echo ========================================
echo GitFileSync Installation
echo ========================================
echo.

REM Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Please run this installer as Administrator!
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo [1/3] Checking Node.js installation...
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

node --version
echo Node.js detected successfully.
echo.

echo [2/3] Installing dependencies...
call npm install --production
if %errorLevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [3/3] Installing Windows Service...
call npm run install:service
if %errorLevel% neq 0 (
    echo ERROR: Failed to install service
    pause
    exit /b 1
)
echo.

echo ========================================
echo SUCCESS!
echo ========================================
echo.
echo GitFileSync is now installed and running.
echo Look for the icon in the system tray.
echo.
echo To configure:
echo 1. Edit .env file with your GitHub settings
echo 2. Restart the service from system tray
echo.
echo To uninstall:
echo Run uninstall.bat as Administrator
echo.
pause
"@

Set-Content "$DIST_DIR\install.bat" -Value $installerScript
Write-Host "  Created install.bat" -ForegroundColor Gray

# Create uninstaller
$uninstallerScript = @"
@echo off
echo ========================================
echo GitFileSync Uninstallation
echo ========================================
echo.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Please run as Administrator!
    pause
    exit /b 1
)

echo Removing Windows Service...
call npm run uninstall:service

echo.
echo Removing startup entries...
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run\GitFileSync" /f 2>nul

echo.
echo ========================================
echo Uninstallation Complete
echo ========================================
echo.
echo You can now delete this folder manually.
echo.
pause
"@

Set-Content "$DIST_DIR\uninstall.bat" -Value $uninstallerScript
Write-Host "  Created uninstall.bat" -ForegroundColor Gray

# Create README for distribution
$distReadme = @"
# GitFileSync v$VERSION

## Quick Start

### Installation
1. Run `install.bat` as Administrator
2. Edit `.env` file with your GitHub settings
3. Restart the application from system tray

### Configuration
Edit `.env` file:
- `GITHUB_PAT`: Your GitHub Personal Access Token
- `REPO_URL`: Your GitHub repository URL
- `SYNC_DIR`: Directory to sync files

### Uninstall
Run `uninstall.bat` as Administrator

## Features
- ✅ Automatic bi-directional sync
- ✅ System tray integration
- ✅ Windows Service support
- ✅ Real-time file monitoring
- ✅ Conflict resolution
- ✅ Multi-PC sync

## Requirements
- Windows 10/11
- Node.js 18+
- GitHub account with Personal Access Token

## Support
For issues, visit: https://github.com/yourusername/git-file-sync
"@

Set-Content "$DIST_DIR\QUICKSTART.md" -Value $distReadme
Write-Host "  Created QUICKSTART.md" -ForegroundColor Gray

# Create portable ZIP
Write-Host "`nCreating portable ZIP package..." -ForegroundColor Yellow
$zipName = "$APP_NAME-v$VERSION-win-x64.zip"
Compress-Archive -Path "$DIST_DIR\*" -DestinationPath "$DIST_DIR\$zipName" -Force

Write-Host "`n✓ Distribution package created successfully!" -ForegroundColor Green
Write-Host "`nFiles created:" -ForegroundColor Cyan
Write-Host "  1. $DIST_DIR\ (Complete application folder)" -ForegroundColor White
Write-Host "  2. $DIST_DIR\install.bat (Installation script)" -ForegroundColor White
Write-Host "  3. $DIST_DIR\uninstall.bat (Uninstallation script)" -ForegroundColor White
Write-Host "  4. $DIST_DIR\.env (Configuration template)" -ForegroundColor White
Write-Host "  5. $DIST_DIR\$zipName (Portable ZIP package)" -ForegroundColor White

Write-Host "`nDistribution Instructions:" -ForegroundColor Yellow
Write-Host "  Share the ZIP file: $DIST_DIR\$zipName" -ForegroundColor White
Write-Host "`nUsers need to:" -ForegroundColor Cyan
Write-Host "  1. Install Node.js 18+ from https://nodejs.org/" -ForegroundColor Gray
Write-Host "  2. Extract the ZIP" -ForegroundColor Gray
Write-Host "  3. Run install.bat as Administrator" -ForegroundColor Gray
Write-Host "  4. Configure .env file" -ForegroundColor Gray

Write-Host "`n✓ Done!" -ForegroundColor Green
