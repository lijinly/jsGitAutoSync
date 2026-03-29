const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const crypto = require('crypto');

// 单实例检查 - 使用锁文件
const lockFilePath = path.join(require('os').tmpdir(), 'GitFileSync.lock');
const lockId = crypto.randomBytes(16).toString('hex');

function acquireLock() {
  try {
    fs.writeFileSync(lockFilePath, lockId, { flag: 'wx' });
    
    // 注册退出时清理锁文件
    process.on('exit', releaseLock);
    process.on('SIGINT', () => {
      releaseLock();
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      releaseLock();
      process.exit(0);
    });
    process.on('uncaughtException', () => {
      releaseLock();
      process.exit(1);
    });
    
    return true;
  } catch (err) {
    if (err.code === 'EEXIST') {
      // 锁文件已存在，检查进程是否仍在运行
      try {
        const existingLockId = fs.readFileSync(lockFilePath, 'utf8');
        // 简单的检查：如果锁文件存在，认为已有实例运行
        return false;
      } catch (readErr) {
        // 读取失败，尝试获取锁
        return true;
      }
    }
    return false;
  }
}

function releaseLock() {
  try {
    if (fs.existsSync(lockFilePath)) {
      fs.unlinkSync(lockFilePath);
    }
  } catch (err) {
    // 忽略清理错误
  }
}

// 检查单实例
if (!acquireLock()) {
  console.log('❌ GitFileSync 已在运行中，无法启动第二个实例');
  console.log('如果确定没有运行，请删除锁文件：' + lockFilePath);
  process.exit(0);
}

// 加载 .env 配置
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// 校验必填配置
function validateConfig() {
  const required = ['GITHUB_PAT', 'REPO_URL', 'SYNC_DIR'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ 缺少必填配置项: ${missing.join(', ')}`);
    console.error('请复制 .env.example 为 .env 并填写配置');
    process.exit(1);
  }

  return {
    GITHUB_PAT: process.env.GITHUB_PAT,
    REPO_URL: process.env.REPO_URL,
    BRANCH: process.env.BRANCH || 'main',
    SYNC_DIR: process.env.SYNC_DIR,
    PULL_INTERVAL: parseInt(process.env.PULL_INTERVAL, 10) || 30,
    PC_NAME: process.env.PC_NAME || 'UnknownPC',
    GIT_USER_NAME: process.env.GIT_USER_NAME || 'SyncBot',
    GIT_USER_EMAIL: process.env.GIT_USER_EMAIL || 'bot@example.com',
  };
}

const config = validateConfig();
const logger = require('./logger');
const GitSync = require('./git');
const FileWatcher = require('./watcher');
const SyncScheduler = require('./syncer');

// 核心组件
const gitSync = new GitSync(config);
const watcher = new FileWatcher(gitSync, config.SYNC_DIR);
const syncer = new SyncScheduler(gitSync, config.PULL_INTERVAL);

let isRunning = false;

async function startSync() {
  if (isRunning) return;

  isRunning = true;
  logger.info(`===== GitFileSync 启动 [${config.PC_NAME}] =====`);
  logger.info(`同步目录: ${config.SYNC_DIR}`);
  logger.info(`仓库: ${config.REPO_URL.replace(/ghp_[a-zA-Z0-9]+@/, '***@')}`);
  logger.info(`Pull 间隔: ${config.PULL_INTERVAL} 秒`);

  try {
    // 初始化 Git 仓库
    await gitSync.init();

    // 首次 pull 确保最新
    await gitSync.pull();

    // 启动文件监控
    watcher.start();

    // 启动定时 pull
    syncer.start();

    logger.info('✅ 同步已启动');
  } catch (err) {
    logger.error(`启动失败: ${err.message}`);
    isRunning = false;
    // Update tray to stopped state on error
    if (tray.isRunning) {
      tray.stopSync();
    }
  }
}

function stopSync() {
  if (!isRunning) return;
  isRunning = false;
  watcher.stop();
  syncer.stop();
  logger.info('⏸️ 同步已停止');
}

// 处理命令行参数
const args = process.argv.slice(2);
if (args.includes('--install')) {
  // 安装服务模式
  const { installService } = require('./installer');
  installService();
  return;
} else if (args.includes('--uninstall')) {
  // 卸载服务模式
  const { uninstallService } = require('./installer');
  uninstallService();
  return;
}

// 自动启动同步
startSync();

// 优雅退出
process.on('SIGINT', () => {
  stopSync();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopSync();
  process.exit(0);
});

// 未捕获异常
process.on('uncaughtException', (err) => {
  logger.error(`未捕获异常: ${err.message}`);
  logger.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`未处理的 Promise 拒绝: ${reason}`);
});
