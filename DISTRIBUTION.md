# GitFileSync - Windows Distribution Guide

## 📦 Distribution Methods

### Method 1: Executable Package (Recommended for End Users)

Build a standalone `.exe` file that doesn't require Node.js installation.

#### Build Steps

**Option A: Using Batch Script**
```batch
# Build executable only
.\build-exe.bat

# Or create full release package
.\create-release.bat
```

**Option B: Manual Build**
```batch
# Install dependencies
npm install

# Build executable
npx pkg . --targets node18-win-x64 --output release/AGitFileSync.exe
```

#### Distribution Package Structure

```
AGitFileSync-v1.0.0/
├── AGitFileSync.exe      ← Main executable (no Node.js required!)
├── INSTALL.bat           ← One-click installer
├── service-install.bat   ← Manual install
├── service-uninstall.bat ← Manual uninstall
├── .env.example          ← Configuration template
├── README.md             ← User guide
└── logs/                 ← Log directory
```

#### User Installation Steps

1. **Download** the zip file
2. **Extract** to a folder (e.g., `C:\Program Files\AGitFileSync`)
3. **Right-click** `INSTALL.bat` → **Run as administrator**
4. **Edit** `.env` file with GitHub settings
5. **Done!** Service runs automatically

---

### Method 2: Source Code Distribution (For Developers)

Distribute the full source code for users with Node.js installed.

#### Package Structure

```
jsGitAutoSync/
├── src/                  ← Source code
├── docs/                 ← Documentation
├── .env.example
├── package.json
├── service-install.bat
├── service-uninstall.bat
└── README.md
```

#### User Installation Steps

```batch
# 1. Extract files
# 2. Open cmd in the folder

# 3. Install dependencies
npm install

# 4. Configure
copy .env.example .env
notepad .env

# 5. Install as service
npm run install:service

# 6. Start service
net start AGitFileSyncService
```

---

## 🔧 Build Scripts

### build-exe.bat
Builds standalone executable from source.

**Usage:**
```batch
.\build-exe.bat
```

**Output:** `release\AGitFileSync.exe`

### create-release.bat
Creates complete distribution package with all necessary files.

**Usage:**
```batch
.\create-release.bat
```

**Output:**
```
release/
├── AGitFileSync.exe
├── INSTALL.bat
├── service-install.bat
├── service-uninstall.bat
├── .env.example
├── README.md
└── logs/
```

---

## 📋 Pre-built Package Contents

### For End Users (No Node.js Required)

| File | Purpose |
|------|---------|
| `AGitFileSync.exe` | Main application (packaged with Node.js) |
| `INSTALL.bat` | One-click installer |
| `service-install.bat` | Manual service install |
| `service-uninstall.bat` | Manual service uninstall |
| `.env.example` | Configuration template |
| `README.md` | User documentation |

### For Developers (Node.js Required)

| File | Purpose |
|------|---------|
| `src/` | Source code |
| `package.json` | Dependencies |
| `service-install.bat` | Install script |
| `service-uninstall.bat` | Uninstall script |
| `.env.example` | Configuration template |

---

## 🚀 Quick Distribution Checklist

### Building Release Package

- [ ] Run `create-release.bat`
- [ ] Verify `release\AGitFileSync.exe` exists
- [ ] Test `INSTALL.bat` in clean VM
- [ ] Zip the `release\` folder
- [ ] Rename zip to `AGitFileSync-v1.0.0.zip`

### Testing Installation

- [ ] Extract to fresh Windows VM
- [ ] Run `INSTALL.bat` as Administrator
- [ ] Configure `.env` file
- [ ] Verify service starts: `sc query AGitFileSyncService`
- [ ] Check logs: `logs\sync.log`

### Distribution

- [ ] Upload to file server / GitHub Releases
- [ ] Document download link
- [ ] Provide installation instructions

---

## 💡 Tips

### Reducing Executable Size

The `pkg` bundled executable includes Node.js runtime, so it's ~40MB.

To reduce size:
1. Use `pkg` with compression: `--compress Brotli`
2. Exclude unnecessary files in `package.json`:
```json
{
  "pkg": {
    "assets": [],
    "scripts": ["src/**/*.js"]
  }
}
```

### Adding Version Info

Create `version.txt` in release folder:
```batch
(
echo GitFileSync v1.0.0
echo Build: %date% %time%
echo Node: 18.x
echo) > release\version.txt
```

### Code Signing (Recommended for Production)

Sign the executable with a code signing certificate:
```batch
signtool sign /f certificate.pfx /p password AGitFileSync.exe
```

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `pkg` not found
```batch
npm install -g pkg
```

**Error:** Permission denied
```batch
# Run as Administrator
```

### Service Won't Start

**Check:** Executable path in service config
```batch
sc qc AGitFileSyncService
```

**Fix:** Reinstall service
```batch
service-uninstall.bat
service-install.bat
```

### Missing Dependencies

**Error:** Module not found
```batch
# Ensure all dependencies are in package.json
npm install
```

---

## 📚 References

- [pkg Documentation](https://github.com/vercel/pkg)
- [node-windows Documentation](https://github.com/coreybutler/node-windows)
- [Windows Service Best Practices](https://docs.microsoft.com/en-us/windows/win32/services/service-best-practices)

---

**Ready to distribute! 🚀**
