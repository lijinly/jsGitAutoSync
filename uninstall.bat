@echo off
echo ========================================
echo GitFileSync - Uninstall
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

echo [1/2] Stopping service...
net stop AGitFileSyncService 2>nul
if %errorLevel% neq 0 (
    echo Service was not running or already stopped
) else (
    echo Service stopped
)
echo.

echo [2/2] Uninstalling service...
AGitFileSync.exe --uninstall
echo.

echo ========================================
echo Uninstall complete!
echo ========================================
echo.
echo You can now delete this folder if desired.
echo.
pause
