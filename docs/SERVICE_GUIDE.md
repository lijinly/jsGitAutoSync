# GitFileSync - Windows Service Installation Guide

## 📋 Overview

GitFileSync can run as a Windows Service, which provides:
- ✅ Automatic startup on boot
- ✅ Runs in background (no console window)
- ✅ Automatic restart on failure
- ✅ System-level integration

---

## 🚀 Quick Installation

### Method 1: Using Batch File (Recommended)

**Step 1: Run Installer**
```batch
Right-click service-install.bat
Select "Run as administrator"
```

**Step 2: Verify Installation**
```batch
# Check service status
sc query AGitFileSyncService

# Or use Services app
services.msc
```

### Method 2: Using Command Line

**Step 1: Open Administrator Command Prompt**
```
Search "cmd" → Right-click → Run as administrator
```

**Step 2: Install Service**
```batch
cd C:\path\to\jsGitAutoSync
npm install
npm run install:service
```

---

## 🎮 Service Control

### Start Service

**Option A: Command Line**
```batch
net start AGitFileSyncService
```

**Option B: Services Console**
1. Press `Win + R`
2. Type `services.msc`
3. Find "AGitFileSyncService"
4. Right-click → Start

**Option C: PowerShell**
```powershell
Start-Service AGitFileSyncService
```

### Stop Service

**Option A: Command Line**
```batch
net stop AGitFileSyncService
```

**Option B: Services Console**
1. Press `Win + R`
2. Type `services.msc`
3. Find "AGitFileSyncService"
4. Right-click → Stop

**Option C: PowerShell**
```powershell
Stop-Service AGitFileSyncService
```

### Restart Service

```batch
net stop AGitFileSyncService
net start AGitFileSyncService
```

Or:
```powershell
Restart-Service AGitFileSyncService
```

---

## 📊 Service Status

### Check Status

**Command Line:**
```batch
sc query AGitFileSyncService
```

**PowerShell:**
```powershell
Get-Service AGitFileSyncService
```

**Services Console:**
1. Press `Win + R`
2. Type `services.msc`
3. Find "AGitFileSyncService"
4. View status column

### View Logs

**Sync Logs:**
```
logs/sync.log
```

**Error Logs:**
```
logs/error.log
```

**Windows Event Viewer:**
1. Press `Win + R`
2. Type `eventvwr.msc`
3. Navigate to: Windows Logs → Application
4. Look for "GitFileSync" or "node-windows" events

---

## ⚙️ Service Configuration

### Service Properties

**Service Name:** AGitFileSyncService

**Display Name:** AGitFileSyncService

**Description:** Git File Sync Service - Bi-directional sync using GitHub

**Startup Type:** Automatic

**Log On As:** Local System

### Modify Service

**Change Startup Type:**
```batch
# Automatic (default)
sc config AGitFileSyncService start= auto

# Manual
sc config AGitFileSyncService start= demand

# Disabled
sc config AGitFileSyncService start= disabled
```

**Change Recovery Options:**
```batch
# Restart on failure
sc failure AGitFileSyncService reset= 86400 actions= restart/60000/restart/60000/restart/60000
```

---

## 🔧 Troubleshooting

### Service Won't Start

**Check 1: Node.js Installation**
```batch
node --version
```
If not found, install Node.js from https://nodejs.org/

**Check 2: Dependencies**
```batch
npm install
```

**Check 3: Configuration**
```batch
# Verify .env exists
dir .env

# Check configuration
type .env
```

**Check 4: Logs**
```batch
type logs\error.log
```

### Service Starts Then Stops

**Common Causes:**
1. Missing `.env` configuration
2. Invalid GitHub PAT token
3. Network connectivity issues
4. SYNC_DIR not accessible

**Solution:**
1. Check `logs/error.log`
2. Verify `.env` configuration
3. Test GitHub connection
4. Ensure sync directory exists

### Service Not Responding

**Force Stop:**
```batch
taskkill /F /IM node.exe
net start AGitFileSyncService
```

**Complete Reset:**
```batch
net stop AGitFileSyncService
npm run uninstall:service
npm run install:service
net start AGitFileSyncService
```

---

## 📝 Uninstallation

### Method 1: Using Batch File

```batch
Right-click service-uninstall.bat
Select "Run as administrator"
```

### Method 2: Using Command Line

**Step 1: Stop Service**
```batch
net stop AGitFileSyncService
```

**Step 2: Uninstall Service**
```batch
npm run uninstall:service
```

**Step 3: Remove Files**
```batch
# Delete application folder
rmdir /s /q C:\path\to\jsGitAutoSync
```

---

## 🎯 Advanced Configuration

### Set Custom Service Name

Edit `src/installer.js`:
```javascript
const svc = new Service({
  name: 'YourCustomServiceName',
  // ...
});
```

### Configure Auto-Restart Delay

Edit `src/installer.js`:
```javascript
const svc = new Service({
  // ...
  restartDelay: 5000, // 5 seconds
  maxRetries: 3,
  // ...
});
```

### Add Environment Variables

Edit `.env`:
```env
# Sync Configuration
GITHUB_PAT=ghp_xxxxx
REPO_URL=https://...
SYNC_DIR=C:\Users\...\GitSync
PULL_INTERVAL=60

# Git Configuration
GIT_USER_NAME=SyncBot
GIT_USER_EMAIL=bot@example.com

# Custom Settings
LOG_LEVEL=info
PC_NAME=OfficePC
```

---

## 🔒 Security Considerations

### Service Account

**Default:** Local System (highest privileges)

**Recommended for Production:**
1. Create dedicated service account
2. Grant minimal required permissions
3. Configure in Services console

### GitHub PAT Security

**Best Practices:**
1. Use minimum required scopes (`repo` only)
2. Store in `.env` (not in code)
3. Rotate regularly
4. Never commit to Git

### File Permissions

**Sync Directory:**
- Grant read/write to service account
- Restrict access to authorized users only

**Application Folder:**
- Grant read/execute to service account
- Restrict write access

---

## 📞 Support

### Common Issues

| Issue | Solution |
|-------|----------|
| "Access denied" | Run as Administrator |
| "Service not found" | Reinstall service |
| "Node.js not found" | Install Node.js 18+ |
| "Configuration missing" | Create `.env` file |

### Get Help

1. **Check Logs:** `logs/error.log`
2. **View Events:** Windows Event Viewer
3. **Verify Config:** Check `.env` file
4. **Test Manually:** Run `npm start` first

---

## 🎓 Best Practices

1. **Always run as Administrator** when installing/uninstalling
2. **Test with `npm start`** before installing as service
3. **Monitor logs** regularly for issues
4. **Configure recovery** options for production use
5. **Use .gitignore** to exclude `.env` and logs
6. **Backup configuration** before updates

---

## 📚 Additional Resources

- [Node-Windows Documentation](https://github.com/coreybutler/node-windows)
- [Windows Services Guide](https://docs.microsoft.com/en-us/dotnet/framework/windows-services/)
- [GitHub PAT Setup](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

---

**Happy Syncing! 🚀**
