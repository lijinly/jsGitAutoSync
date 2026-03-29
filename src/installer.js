const path = require('path');
const { Service } = require('node-windows');
const logger = require('./logger');

const SVC_NAME = 'GitFileSync';
const SVC_DESC = '多PC端文件同步服务 - 基于GitHub仓库';

// 获取项目根目录（installer.js 在 src/ 下）
const projectRoot = path.resolve(__dirname, '..');

const svcConfig = {
  name: SVC_NAME,
  description: SVC_DESC,
  script: path.join(projectRoot, 'src', 'index.js'),
  nodeOptions: [],
  workingDirectory: projectRoot,
  env: [
    { name: 'NODE_ENV', value: 'production' },
  ],
};

function installService() {
  const svc = new Service(svcConfig);

  svc.on('install', () => {
    logger.info(`服务 "${SVC_NAME}" 安装成功！`);
    logger.info('服务已设置为开机自启');
    svc.start();
    logger.info('服务已启动');
    process.exit(0);
  });

  svc.on('alreadyinstalled', () => {
    logger.warn(`服务 "${SVC_NAME}" 已经安装过了`);
    logger.info('如需重装，请先运行: node src/installer.js --uninstall');
    process.exit(1);
  });

  svc.on('error', (err) => {
    logger.error(`服务安装失败: ${err.message}`);
    process.exit(1);
  });

  logger.info(`正在安装服务 "${SVC_NAME}"...`);
  svc.install();
}

function uninstallService() {
  const svc = new Service(svcConfig);

  svc.on('uninstall', () => {
    logger.info(`服务 "${SVC_NAME}" 卸载成功`);
    process.exit(0);
  });

  svc.on('error', (err) => {
    logger.error(`服务卸载失败: ${err.message}`);
    process.exit(1);
  });

  svc.on('start', () => {
    logger.info('服务已启动（卸载前确保已停止）');
  });

  logger.info(`正在卸载服务 "${SVC_NAME}"...`);

  // 先停止再卸载
  svc.stop();
  setTimeout(() => {
    svc.uninstall();
  }, 2000);
}

// 命令行参数解析
const args = process.argv.slice(2);
if (args.includes('--install')) {
  installService();
} else if (args.includes('--uninstall')) {
  uninstallService();
} else {
  console.log('用法:');
  console.log('  安装服务: node src/installer.js --install');
  console.log('  卸载服务: node src/installer.js --uninstall');
  process.exit(0);
}
