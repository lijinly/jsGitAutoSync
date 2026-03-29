# GitFileSync - Quick Start Guide

## 🚀 For End Users (No Node.js Required)

### Installation

1. **Download** the release package (e.g., `AGitFileSync-v1.0.0.zip`)
2. **Extract** to a folder (e.g., `C:\Program Files\AGitFileSync`)
3. **Right-click** `setup.bat` → **Run as administrator**
4. **Edit** `.env` file with your GitHub settings
5. **Run** `setup.bat` again to complete installation

### Uninstallation

1. **Right-click** `uninstall.bat` → **Run as administrator**
2. **Delete** the folder if desired

### Service Control

```batch
# Start
net start AGitFileSyncService

# Stop
net stop AGitFileSyncService

# Check status
sc query AGitFileSyncService

# View logs
type logs\sync.log
```

---

## 🛠️ For Developers (Node.js Required)

### Installation

```batch
# 1. Clone/download source code
# 2. Install dependencies
npm install

# 3. Configure
copy .env.example .env
notepad .env

# 4. Install as service
npm run install:service

# 5. Start service
net start AGitFileSyncService
```

### Build Executable

```batch
# Build only
.\build-exe.bat

# Or create full release package
.\create-release.bat
```

---

## 📋 Configuration (.env)

```env
# Required
GITHUB_PAT=ghp_your_token_here
REPO_URL=https://ghp_your_token_here@github.com/username/repo.git
SYNC_DIR=C:\Users\YourName\SyncFolder

# Optional
BRANCH=main
PULL_INTERVAL=30
PC_NAME=OfficePC
GIT_USER_NAME=SyncBot
GIT_USER_EMAIL=bot@example.com
```

---

## 🎯 Quick Commands

| Action | Command |
|--------|---------|
| Install | `setup.bat` (as Admin) |
| Uninstall | `uninstall.bat` (as Admin) |
| Start | `net start AGitFileSyncService` |
| Stop | `net stop AGitFileSyncService` |
| Status | `sc query AGitFileSyncService` |
| Logs | `logs\sync.log` |

---

## 🐛 Troubleshooting

**Service won't start?**
- Check `.env` configuration
- View logs: `logs\error.log`
- Ensure GitHub token has `repo` permission

**Need help?**
- See [DISTRIBUTION.md](DISTRIBUTION.md) for detailed guide
- See [docs/SERVICE_GUIDE.md](docs/SERVICE_GUIDE.md) for service management
