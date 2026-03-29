const logger = require('./logger');

class SyncScheduler {
  constructor(gitSync, intervalSec) {
    this.gitSync = gitSync;
    this.intervalSec = intervalSec || 30;
    this.timer = null;
    this.running = false;
  }

  start() {
    if (this.running) return;

    this.running = true;
    logger.info(`定时 Pull 已启动，间隔: ${this.intervalSec} 秒`);

    this.timer = setInterval(async () => {
      await this.gitSync.pull();
    }, this.intervalSec * 1000);

    // 立即执行一次
    this.gitSync.pull();
  }

  stop() {
    if (!this.running) return;

    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    logger.info('定时 Pull 已停止');
  }
}

module.exports = SyncScheduler;
