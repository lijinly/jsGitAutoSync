const { simpleGit, SimpleGit } = require('simple-git');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class GitSync {
  constructor(config) {
    this.syncDir = config.SYNC_DIR;
    this.repoUrl = config.REPO_URL;
    this.branch = config.BRANCH || 'main';
    this.userName = config.GIT_USER_NAME || 'SyncBot';
    this.userEmail = config.GIT_USER_EMAIL || 'bot@example.com';
    this.pcName = config.PC_NAME || 'UnknownPC';
    this.git = null;
    this.isSyncing = false;
  }

  async init() {
    // 确保 syncDir 存在
    if (!fs.existsSync(this.syncDir)) {
      fs.mkdirSync(this.syncDir, { recursive: true });
    }

    const isRepo = fs.existsSync(path.join(this.syncDir, '.git'));

    if (!isRepo) {
      logger.info('本地仓库不存在，正在克隆...');
      await this.clone();
    } else {
      this.git = simpleGit(this.syncDir);
      await this.git.raw(['config', 'user.name', this.userName]);
      await this.git.raw(['config', 'user.email', this.userEmail]);
      logger.info('本地仓库已就绪');
    }
  }

  async clone() {
    this.git = simpleGit();
    try {
      await this.git.clone(this.repoUrl, this.syncDir, ['--branch', this.branch, '--single-branch']);
      this.git = simpleGit(this.syncDir);
      await this.git.raw(['config', 'user.name', this.userName]);
      await this.git.raw(['config', 'user.email', this.userEmail]);
      logger.info(`仓库克隆成功: ${this.syncDir}`);
    } catch (err) {
      logger.warn(`克隆失败: ${err.message} - 将使用本地模式运行`);
      // 不抛异常，继续运行
    }
  }

  getGit() {
    if (!this.git) {
      this.git = simpleGit(this.syncDir);
    }
    return this.git;
  }

  async hasRemoteChanges() {
    try {
      const git = this.getGit();
      await git.fetch('origin', this.branch);
      const log = await git.log([`HEAD..origin/${this.branch}`]);
      return log.total > 0;
    } catch (err) {
      logger.warn(`检查远程变更失败: ${err.message} - 跳过本次检查`);
      return false;
    }
  }

  async hasLocalChanges() {
    try {
      const git = this.getGit();
      const status = await git.status();
      return status.modified.length > 0 ||
             status.created.length > 0 ||
             status.deleted.length > 0 ||
             status.renamed.length > 0;
    } catch (err) {
      logger.error(`检查本地变更失败: ${err.message}`);
      return false;
    }
  }

  async pull() {
    if (this.isSyncing) return false;
    this.isSyncing = true;

    try {
      const git = this.getGit();
      const hasChanges = await this.hasRemoteChanges();

      if (!hasChanges) {
        logger.debug('远程无新变更，跳过 pull');
        return true;
      }

      logger.info('检测到远程更新，正在 pull...');
      await git.pull('origin', this.branch, ['--rebase']);
      logger.info('Pull 成功');
      return true;
    } catch (err) {
      logger.warn(`Pull 失败: ${err.message} - 将在下次重试`);
      if (err.message.includes('CONFLICT')) {
        await this.handleConflict(err);
      }
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  async commitAndPush() {
    if (this.isSyncing) return false;
    this.isSyncing = true;

    try {
      const git = this.getGit();
      const hasChanges = await this.hasLocalChanges();

      if (!hasChanges) {
        logger.debug('本地无变更，跳过 commit');
        return true;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const commitMsg = `[AutoSync] ${this.pcName} ${timestamp}`;

      await git.add('-A');
      await git.commit(commitMsg);
      logger.info(`提交成功: ${commitMsg}`);

      // 先 pull rebase 再 push，减少冲突
      logger.info('推送前先 pull...');
      await git.pull('origin', this.branch, ['--rebase']);

      await git.push('origin', this.branch);
      logger.info('Push 成功');
      return true;
    } catch (err) {
      logger.warn(`Commit/Push 失败: ${err.message} - 将在下次重试`);
      if (err.message.includes('CONFLICT')) {
        await this.handleConflict(err);
      }
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  async handleConflict(err) {
    logger.warn(`检测到冲突: ${err.message}`);

    try {
      const git = this.getGit();
      const status = await git.status();

      // 冲突文件列表
      const conflictedFiles = status.conflicted;
      if (conflictedFiles.length === 0) {
        logger.warn('未找到冲突文件，尝试中止 rebase');
        await git.raw(['rebase', '--abort']);
        return;
      }

      logger.warn(`冲突文件: ${conflictedFiles.join(', ')}`);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

      // 备份冲突文件（保留本地版本）
      for (const file of conflictedFiles) {
        const filePath = path.join(this.syncDir, file);
        if (fs.existsSync(filePath)) {
          const backupPath = `${filePath}_conflict_${timestamp}`;
          fs.copyFileSync(filePath, backupPath);
          logger.info(`冲突文件已备份: ${backupPath}`);
        }
      }

      // 采用远程版本，继续 rebase
      await git.raw(['checkout', '--theirs', '.']);
      await git.add('-A');
      await git.raw(['rebase', '--continue']);

      // 设置环境变量跳过编辑器
      process.env.GIT_EDITOR = 'true';

      // 再次 push
      await git.push('origin', this.branch);
      logger.info('冲突已解决（采用远程版本），push 成功');

    } catch (resolveErr) {
      logger.error(`冲突解决失败: ${resolveErr.message}`);
      try {
        await git.raw(['rebase', '--abort']);
        logger.info('Rebase 已中止');
      } catch (abortErr) {
        logger.error(`中止 rebase 也失败: ${abortErr.message}`);
      }
    }
  }
}

module.exports = GitSync;
