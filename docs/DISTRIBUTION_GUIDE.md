# GitFileSync Distribution Guide

## 📦 Quick Start

### For Developers (Building the Distribution)

**Run the distribution script:**
```powershell
.\docs\distribute-simple.ps1
```

This will create a ready-to-distribute package in the `release\` folder.

---

## 🚀 Distribution Methods

### Method 1: Node.js Package (Recommended)

**What you get:**
- Complete application folder (~33 KB ZIP)
- Installation scripts
- Configuration templates
- Requires Node.js on target machine

**Best for:**
- Internal company distribution
- Users who already have Node.js
- Quick deployment

**Distribution file:**
```
release/GitFileSync-v1.0.0-win-x64.zip
```

---

### Method 2: Standalone Executable (Advanced)

**What you get:**
- Single .exe file (~100 MB)
- No Node.js required
- Larger file size

**Best for:**
- Public distribution
- Users without Node.js
- Professional appearance

**Note:** This method requires additional setup with Inno Setup or pkg tool.

---

## 📋 User Installation Guide

### Prerequisites

Users need:
- ✅ Windows 10/11
- ✅ Node.js 18+ ([Download here](https://nodejs.org/))
- ✅ Administrator rights
- ✅ GitHub account

### Installation Steps

**1. Extract ZIP**
```
Extract GitFileSync-v1.0.0-win-x64.zip to desired location
Example: C:\Program Files\GitFileSync\
```

**2. Configure Settings**

Edit `.env` file:
```bash
# GitHub Personal Access Token
GITHUB_PAT=ghp_your_token_here

# Repository URL (include token)
REPO_URL=https://ghp_your_token_here@github.com/username/repo.git

# Local sync directory
SYNC_DIR=C:\Users\YourName\GitSync

# Pull interval (seconds)
PULL_INTERVAL=30

# PC name
PC_NAME=MyComputer
```

**3. Install**
```
1. Right-click install.bat
2. Select "Run as administrator"
3. Follow the prompts
```

**4. Verify**
```
- Look for GitFileSync icon in system tray (bottom-right corner)
- Right-click icon to see menu
- Green icon = Sync running
- Gray icon = Sync stopped
```

---

## 🎯 What's in the Distribution Package

```
release/
├── GitFileSync-v1.0.0-win-x64.zip    ← Share this ZIP file
├── install.bat                        ← Installation script
├── uninstall.bat                      ← Uninstallation script
├── .env                              ← Configuration (user must edit)
├── .env.example                      ← Configuration example
├── package.json                      ← App metadata
├── package-lock.json                 ← Dependencies
├── README.md                         ← Documentation
├── QUICKSTART.md                     ← Quick start guide
└── src/                              ← Application code
    ├── index.js                      ← Main entry point
    ├── tray.js                       ← System tray UI
    ├── syncer.js                     ← Sync scheduler
    ├── watcher.js                    ← File watcher
    ├── git.js                        ← Git operations
    ├── installer.js                  ← Windows service installer
    └── logger.js                     ← Logging utility
```

---

## 🔧 Configuration Reference

### Required Settings

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_PAT` | GitHub Personal Access Token | `ghp_xxxx` |
| `REPO_URL` | Full repository URL with token | `https://ghp_xxx@github.com/user/repo.git` |
| `SYNC_DIR` | Local directory to sync | `C:\Users\Name\GitSync` |

### Optional Settings

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `BRANCH` | Git branch to sync | `main` | `main` |
| `PULL_INTERVAL` | Auto-pull interval (seconds) | `30` | `30` |
| `PC_NAME` | Computer identifier | `UnknownPC` | `Office-PC` |
| `GIT_USER_NAME` | Git commit user name | `SyncBot` | `John Doe` |
| `GIT_USER_EMAIL` | Git commit email | `bot@example.com` | `john@example.com` |

---

## 🛠️ Creating GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "GitFileSync")
4. Select scopes: **repo** (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** - you won't see it again!
7. Paste it in `.env` file as `GITHUB_PAT=ghp_xxxxx`

---

## 📤 Distribution Checklist

Before distributing to users:

- [ ] Test installation on clean Windows machine
- [ ] Verify Node.js requirement is documented
- [ ] Test with default configuration
- [ ] Test system tray icon appears
- [ ] Test sync functionality
- [ ] Test uninstallation process
- [ ] Include QUICKSTART.md
- [ ] Update version numbers if needed
- [ ] Test with spaces in paths
- [ ] Verify error messages are clear

---

## 🐛 Troubleshooting

### "Node.js is not installed"
**Solution:** Install Node.js 18+ from https://nodejs.org/

### "Access denied" or "Permission denied"
**Solution:** Run installation scripts as Administrator (right-click → Run as administrator)

### System tray icon not visible
**Solutions:**
1. Check Windows notification area settings
2. Enable "Show all icons in notification area" in Windows settings
3. Restart the application from system tray menu

### Service won't start
**Solutions:**
1. Check logs in `logs\` directory
2. Verify `.env` configuration is correct
3. Run `npm run install:service` again as Administrator
4. Check Windows Event Viewer for errors

### Sync not working
**Solutions:**
1. Verify GitHub token is valid
2. Check repository URL includes the token
3. Ensure SYNC_DIR exists and is accessible
4. Check network connectivity
5. Verify GitHub repository permissions

---

## 📞 Support

For issues or questions:

1. **Check logs:** `logs\` directory
2. **Review documentation:** `README.md`, `QUICKSTART.md`
3. **GitHub Issues:** Create an issue on GitHub
4. **Contact:** Support email or team channel

---

## 🔄 Updating Installed Application

To update an existing installation:

**Method 1: Manual Update**
```
1. Stop the service from system tray
2. Replace files in installation folder
3. Restart from system tray
```

**Method 2: Reinstall**
```
1. Run uninstall.bat as Administrator
2. Delete old installation folder
3. Extract new version
4. Run install.bat as Administrator
5. Reconfigure .env if needed
```

---

## 📝 Version History

### v1.0.0 (2026-03-29)
- Initial release
- Bi-directional sync
- System tray integration
- Windows Service support
- Real-time file monitoring
- Automatic conflict resolution

---

## 📄 License

Include your LICENSE file in the distribution package.

---

## 🎓 Additional Resources

- **Node.js Download:** https://nodejs.org/
- **GitHub Tokens:** https://github.com/settings/tokens
- **Git Documentation:** https://git-scm.com/doc
- **Windows Services:** https://docs.microsoft.com/en-us/dotnet/framework/windows-services/introduction-to-windows-service-applications

---

**Happy Syncing! 🚀**
