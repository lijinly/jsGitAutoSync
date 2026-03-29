@echo off
echo ========================================
echo GitFileSync - Windows Service Installer
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

echo [1/3] 检查 Node.js 安装...
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo 错误：未检测到 Node.js!
    echo 请先安装 Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

node --version
echo ✓ Node.js 已安装
echo.

echo [2/3] 安装依赖...
call npm install --production
if %errorLevel% neq 0 (
    echo 错误：依赖安装失败!
    pause
    exit /b 1
)
echo ✓ 依赖安装完成
echo.

echo [3/3] 安装 Windows 服务...
call npm run install:service
if %errorLevel% neq 0 (
    echo 错误：服务安装失败!
    pause
    exit /b 1
)
echo ✓ Windows 服务安装完成
echo.

echo ========================================
echo 安装成功!
echo ========================================
echo.
echo GitFileSync 已安装为 Windows 服务
echo 服务名：AGitFileSyncService
echo.
echo 服务控制:
echo   - 启动服务：net start AGitFileSyncService
echo   - 停止服务：net stop AGitFileSyncService
echo   - 重启服务：net stop AGitFileSyncService ^& net start AGitFileSyncService
echo.
echo 或者使用系统托盘图标控制
echo.

REM Send Windows notification
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; $objNotify = New-Object System.Windows.Forms.NotifyIcon; $objNotify.BalloonTipTitle = 'GitFileSync'; $objNotify.BalloonTipText = 'Windows 服务安装成功'; $objNotify.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info; $objNotify.Visible = $true; $objNotify.ShowBalloonTip(3000); Start-Sleep -Milliseconds 3500; $objNotify.Dispose()"

echo ✓ Windows 通知已发送
echo.
pause
