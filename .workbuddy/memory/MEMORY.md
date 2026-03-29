# MEMORY.md

## 项目：GitFileSync (jsGitAutoSync)
- **创建日期**: 2026-03-29
- **用途**: 多PC端文件同步工具，基于 GitHub 仓库 + PAT 认证
- **技术栈**: Node.js + node-windows + systray2 + simple-git + chokidar + winston + dotenv
- **核心功能**:
  - 双向同步：chokidar 实时监控 → 自动 commit/push + 定时 pull
  - 冲突处理：备份冲突文件副本 + 采用远程版本
  - Windows 服务：node-windows 一键安装/卸载，开机自启
  - 系统托盘：systray2，右键菜单（启动/退出）
  - .env 配置：GITHUB_PAT, REPO_URL, SYNC_DIR, PULL_INTERVAL, PC_NAME 等
- **使用方式**:
  - 直接运行: `npm start`
  - 安装服务: `npm run install:service`
  - 卸载服务: `npm run uninstall:service`
