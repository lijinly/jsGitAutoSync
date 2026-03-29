@echo off
echo ========================================
echo GitFileSync - Windows Service Uninstaller
echo ========================================
echo.

REM Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo 错误：需要管理员权限!
    echo 请右键点击此文件，选择"以管理员身份运行"
    echo.
    pause
    exit /b 1
)

echo [1/2] 停止服务...
net stop AGitFileSyncService 2>nul
if %errorLevel% neq 0 (
    echo 服务未运行或已停止
) else (
    echo ✓ 服务已停止
)
echo.

echo [2/2] 卸载 Windows 服务...
call npm run uninstall:service
if %errorLevel% neq 0 (
    echo 错误：服务卸载失败!
    pause
    exit /b 1
)
echo ✓ Windows 服务已卸载
echo.

echo ========================================
echo 卸载完成!
echo ========================================
echo.
echo GitFileSync 服务已从 Windows 卸载
echo.
echo 如需重新安装，请运行: install-service.bat
echo.

REM Send Windows notification
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; $objNotify = New-Object System.Windows.Forms.NotifyIcon; $objNotify.BalloonTipTitle = 'GitFileSync'; $objNotify.BalloonTipText = 'Windows 服务已卸载'; $objNotify.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Warning; $objNotify.Visible = $true; $objNotify.ShowBalloonTip(3000); Start-Sleep -Milliseconds 3500; $objNotify.Dispose()"

echo ✓ Windows 通知已发送
echo.
pause
