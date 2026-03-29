@echo off
echo ========================================
echo GitFileSync - Create Release Package
echo ========================================
echo.

REM Check Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo Error: Node.js not found!
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

echo [2/5] Building executable...
if exist release rmdir /s /q release
mkdir release
npx pkg . --targets node18-win-x64 --output release/AGitFileSync.exe
if %errorLevel% neq 0 (
    echo Error: Build failed!
    pause
    exit /b 1
)
echo.

echo [3/5] Copying configuration files...
copy .env.example release\.env.example >nul
copy setup.bat release\ >nul
copy uninstall.bat release\ >nul
copy README.md release\ >nul
copy QUICKSTART.md release\ >nul
copy DISTRIBUTION.md release\ >nul
echo.

echo [4/5] Creating logs directory...
mkdir release\logs 2>nul
echo.

echo [5/5] Creating installation script...
(
echo @echo off
echo echo ========================================
echo echo GitFileSync - Quick Install
echo echo ========================================
echo echo.
echo echo This will install GitFileSync as a Windows Service.
echo echo.
echo pause
echo.
echo REM Check admin rights
echo net session ^>nul 2^>^&1
echo if %%errorLevel%% neq 0 (
echo     echo Error: Administrator rights required!
echo     echo Please right-click and select "Run as administrator"
echo     pause
echo     exit /b 1
echo ^)
echo.
echo echo [1/3] Checking configuration...
echo if not exist .env (
echo     echo Creating .env from template...
echo     copy .env.example .env
echo     echo Please edit .env with your GitHub settings before running.
echo     notepad .env
echo     pause
echo     exit /b 0
echo ^)
echo.
echo echo [2/3] Installing service...
echo AGitFileSync.exe --install
echo.
echo echo [3/3] Starting service...
echo net start AGitFileSyncService
echo.
echo echo ========================================
echo echo Installation complete!
echo echo ========================================
echo echo.
echo echo Service name: AGitFileSyncService
echo echo.
echo echo Commands:
echo echo   - Start:   net start AGitFileSyncService
echo echo   - Stop:    net stop AGitFileSyncService
echo echo   - Status:  sc query AGitFileSyncService
echo echo.
echo pause
) > release\INSTALL.bat

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
echo   3. Users run INSTALL.bat as Administrator
echo.
pause
