const path = require('path');
const fs = require('fs');
const logger = require('./logger');

class TrayManager {
  constructor() {
    this.systray = null;
    this.onQuit = null;
    this.onStart = null;
    this.onStop = null;
    this.onUninstall = null;
    this.isRunning = false;
    this.iconGreenBase64 = null;
    this.iconGrayBase64 = null;
    this.menuItems = null;
  }

  create(options = {}) {
    this.onQuit = options.onQuit || (() => process.exit(0));
    this.onStart = options.onStart || (() => {});
    this.onStop = options.onStop || (() => {});
    this.onUninstall = options.onUninstall || (() => {});

    // Generate icons if not exist
    const iconGreenPath = path.join(__dirname, 'icon-green.png');
    const iconGrayPath = path.join(__dirname, 'icon-gray.png');

    if (!fs.existsSync(iconGreenPath)) {
      this._createIcon(iconGreenPath, 'green');
    }
    if (!fs.existsSync(iconGrayPath)) {
      this._createIcon(iconGrayPath, 'gray');
    }

    // Read icons and convert to base64
    this.iconGreenBase64 = fs.readFileSync(iconGreenPath).toString('base64');
    this.iconGrayBase64 = fs.readFileSync(iconGrayPath).toString('base64');

    const { default: Systray } = require('systray2');

    this.menuItems = [
      {
        id: 'start',
        title: '▶️ 启动同步',
        tooltip: '启动文件同步',
        checked: false,
        enabled: true,
      },
      {
        id: 'stop',
        title: '⏸️ 停止同步',
        tooltip: '停止文件同步',
        checked: false,
        enabled: false,
      },
      { id: 'sep1', text: '-' },
      {
        id: 'uninstall',
        title: '🗑️ 卸载服务',
        tooltip: '卸载 Windows 服务',
        checked: false,
        enabled: true,
      },
      { id: 'sep2', text: '-' },
      {
        id: 'quit',
        title: '❌ 退出',
        tooltip: '退出程序',
        checked: false,
        enabled: true,
      },
    ];

    this.systray = new Systray({
      menu: {
        icon: this.iconGrayBase64,
        title: 'GitFileSync',
        tooltip: 'GitFileSync - 文件同步工具 (已停止)',
        items: this.menuItems,
      },
      debug: false,
      copyDir: true,
    });

    // Wait for systray to be ready before setting up event handlers
    this.systray.ready().then(() => {
      this.systray.onClick((action) => {
        const menuItem = action.item;
        switch (menuItem.id) {
          case 'start':
            this.startSync();
            break;
          case 'stop':
            this.stopSync();
            break;
          case 'uninstall':
            logger.info('用户选择卸载服务');
            this.onUninstall();
            break;
          case 'quit':
            logger.info('用户从托盘菜单退出');
            this.shutdown();
            break;
        }
      });

      logger.info('系统托盘已启动');
    });
  }

  startSync() {
    this.isRunning = true;
    this.onStart();

    // Update menu items state
    this.menuItems[0].enabled = false; // start
    this.menuItems[1].enabled = true;  // stop

    // Update menu with new icon and items
    this.systray.sendAction({
      type: 'update-menu',
      menu: {
        icon: this.iconGreenBase64,
        title: 'GitFileSync',
        tooltip: 'GitFileSync - 文件同步工具 (运行中)',
        items: this.menuItems,
      },
    });

    logger.info('同步已启动，托盘图标变为绿色');
  }

  stopSync() {
    this.isRunning = false;
    this.onStop();

    // Update menu items state
    this.menuItems[0].enabled = true;  // start
    this.menuItems[1].enabled = false; // stop

    // Update menu with new icon and items
    this.systray.sendAction({
      type: 'update-menu',
      menu: {
        icon: this.iconGrayBase64,
        title: 'GitFileSync',
        tooltip: 'GitFileSync - 文件同步工具 (已停止)',
        items: this.menuItems,
      },
    });

    logger.info('同步已停止，托盘图标变为灰色');
  }

  shutdown() {
    if (this.onQuit) {
      this.onQuit();
    }
    if (this.systray) {
      this.systray.kill();
    }
  }

  _createIcon(iconPath, color = 'green') {
    // 使用预定义的 PNG 图标数据（16x16 圆形图标）
    const colors = {
      green: {
        r: 50, g: 205, b: 50,   // 绿色
      },
      gray: {
        r: 128, g: 128, b: 128, // 灰色
      },
    };

    const palette = colors[color] || colors.green;

    // 创建一个简单的 16x16 PNG，使用预渲染的像素数据
    const zlib = require('zlib');
    const width = 16;
    const height = 16;

    // IHDR chunk
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;  // bit depth
    ihdr[9] = 6;  // color type (RGBA)
    ihdr[10] = 0; // compression
    ihdr[11] = 0; // filter
    ihdr[12] = 0; // interlace

    // 创建圆形图标
    const rowSize = 1 + width * 4;
    const rawData = Buffer.alloc(rowSize * height);

    for (let y = 0; y < height; y++) {
      const rowOffset = y * rowSize;
      rawData[rowOffset] = 0; // filter
      for (let x = 0; x < width; x++) {
        const pixelOffset = rowOffset + 1 + x * 4;
        const cx = x - 7.5;
        const cy = y - 7.5;
        const dist = Math.sqrt(cx * cx + cy * cy);
        
        if (dist < 7) {
          // 圆形内部
          rawData[pixelOffset] = palette.r;
          rawData[pixelOffset + 1] = palette.g;
          rawData[pixelOffset + 2] = palette.b;
          rawData[pixelOffset + 3] = 255;
        } else {
          // 透明背景
          rawData[pixelOffset] = 0;
          rawData[pixelOffset + 1] = 0;
          rawData[pixelOffset + 2] = 0;
          rawData[pixelOffset + 3] = 0;
        }
      }
    }

    const compressed = zlib.deflateSync(rawData, { level: 0 }); // No compression for better compatibility

    // Build PNG
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    const crc32 = (buf) => {
      let crc = 0xFFFFFFFF;
      const table = [];
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
          c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[n] = c;
      }
      for (let i = 0; i < buf.length; i++) {
        crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
      }
      return (crc ^ 0xFFFFFFFF) >>> 0;
    };

    const makeChunk = (type, data) => {
      const typeData = Buffer.concat([Buffer.from(type), data]);
      const len = Buffer.alloc(4);
      len.writeUInt32BE(data.length, 0);
      const crc = Buffer.alloc(4);
      crc.writeUInt32BE(crc32(typeData), 0);
      return Buffer.concat([len, typeData, crc]);
    };

    const png = Buffer.concat([
      signature,
      makeChunk('IHDR', ihdr),
      makeChunk('IDAT', compressed),
      makeChunk('IEND', Buffer.alloc(0)),
    ]);

    fs.writeFileSync(iconPath, png);
    logger.info(`图标已生成: ${iconPath}`);
  }
}

module.exports = TrayManager;
