const path = require('path');
const dotenv = require('dotenv');

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
const TrayManager = require('./tray');

// 核心组件
const gitSync = new GitSync(config);
const watcher = new FileWatcher(gitSync, config.SYNC_DIR);
const syncer = new SyncScheduler(gitSync, config.PULL_INTERVAL);
const tray = new TrayManager();

let isRunning = false;

async function startSync() {
  if (isRunning) {
    // 如果已在运行，停止
    stopSync();
    return;
  }

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
  }
}

function stopSync() {
  isRunning = false;
  watcher.stop();
  syncer.stop();
  logger.info('⏸️ 同步已停止');
}

// 启动托盘
tray.create({
  onStart: () => {
    if (isRunning) {
      stopSync();
    } else {
      startSync();
    }
  },
  onQuit: () => {
    stopSync();
    logger.info('程序退出');
    setTimeout(() => process.exit(0), 500);
  },
});

// 自动启动同步
startSync();

// 优雅退出
process.on('SIGINT', () => {
  stopSync();
  tray.shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopSync();
  tray.shutdown();
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
