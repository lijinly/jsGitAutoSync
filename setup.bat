@echo off
echo ========================================
echo GitFileSync - Setup
echo ========================================
echo.

REM Check admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Error: Administrator rights required!
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo [1/3] Checking configuration...
if not exist .env (
    echo Creating .env from template...
    copy .env.example .env
    echo.
    echo ========================================
    echo Please edit .env with your GitHub settings:
    echo ========================================
    echo.
    echo Required settings:
    echo   - GITHUB_PAT: Your GitHub Personal Access Token
echo   - REPO_URL: Your GitHub repository URL
echo   - SYNC_DIR: Local folder to sync
echo.
    notepad .env
    echo.
    echo Please run setup.bat again after configuring .env
    pause
    exit /b 0
)
echo Configuration file found.
echo.

echo [2/3] Installing service...
AGitFileSync.exe --install
if %errorLevel% neq 0 (
    echo.
    echo Error: Service installation failed!
    echo Please check the logs for details.
    pause
    exit /b 1
)
echo.

echo [3/3] Starting service...
net start AGitFileSyncService
if %errorLevel% neq 0 (
    echo Warning: Service may not have started properly.
    echo You can start it manually: net start AGitFileSyncService
)
echo.

echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Service name: AGitFileSyncService
echo.
echo Commands:
echo   - Start:   net start AGitFileSyncService
echo   - Stop:    net stop AGitFileSyncService
echo   - Status:  sc query AGitFileSyncService
echo   - Logs:    logs\sync.log
echo.
pause
