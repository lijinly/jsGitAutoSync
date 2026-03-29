const chokidar = require('chokidar');
const path = require('path');
const logger = require('./logger');

class FileWatcher {
  constructor(gitSync, syncDir) {
    this.gitSync = gitSync;
    this.syncDir = syncDir;
    this.watcher = null;
    this.debounceTimer = null;
    this.debounceMs = 2000;
    this.running = false;
  }

  start() {
    if (this.running) return;

    this.running = true;
    logger.info(`开始监控目录: ${this.syncDir}`);

    this.watcher = chokidar.watch(this.syncDir, {
      ignored: [
        '**/.git/**',
        '**/*.tmp',
        '**/~*',
        // 忽略冲突备份文件自身
        '**/*_conflict_*',
      ],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 500,
      },
    });

    this.watcher.on('all', (event, filePath) => {
      // 忽略 .git 目录内的变化
      if (filePath.includes(path.join(this.syncDir, '.git'))) return;

      const relPath = path.relative(this.syncDir, filePath);
      logger.debug(`文件变化 [${event}]: ${relPath}`);
      this.schedulePush();
    });

    this.watcher.on('error', (err) => {
      logger.error(`文件监控错误: ${err.message}`);
    });
  }

  schedulePush() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      this.debounceTimer = null;
      await this.gitSync.commitAndPush();
    }, this.debounceMs);
  }

  stop() {
    if (!this.running) return;

    this.running = false;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    logger.info('文件监控已停止');
  }
}

module.exports = FileWatcher;
