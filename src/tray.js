const path = require('path');
const fs = require('fs');
const logger = require('./logger');

class TrayManager {
  constructor() {
    this.systray = null;
    this.onQuit = null;
    this.onStart = null;
  }

  create(options = {}) {
    this.onQuit = options.onQuit || (() => process.exit(0));
    this.onStart = options.onStart || (() => {});

    // 使用内嵌的 16x16 PNG 图标（绿色同步箭头）
    // 这是一个最小化的 PNG：1x1 绿色像素，会被系统缩放
    const iconPath = path.join(__dirname, 'icon.png');
    if (!fs.existsSync(iconPath)) {
      // 生成一个简单的 16x16 绿色图标
      this._createIcon(iconPath);
    }

    const { default: Systray } = require('systray2');

    // Read icon and convert to base64
    const iconBuffer = fs.readFileSync(iconPath);
    const iconBase64 = iconBuffer.toString('base64');

    const menuTemplate = [
      {
        id: 'start',
        title: '🟢 启动同步',
        tooltip: '启动文件同步',
        checked: false,
        enabled: true,
      },
      { id: 'sep1', text: '-' },
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
        icon: iconBase64,
        title: 'GitFileSync',
        tooltip: 'GitFileSync - 文件同步工具',
        items: menuTemplate,
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
            this.onStart();
            // 切换菜单文本
            this.systray.sendAction({
              type: 'update-item',
              id: 'start',
              item: {
                ...menuItem,
                text: '⏸️ 停止同步',
              },
            });
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

  shutdown() {
    if (this.onQuit) {
      this.onQuit();
    }
    if (this.systray) {
      this.systray.kill();
    }
  }

  _createIcon(iconPath) {
    // 生成一个 16x16 的 PNG 图标
    // 使用最小的有效 PNG 格式：单色绿色像素
    // PNG header + IHDR + IDAT + IEND
    const width = 16;
    const height = 16;

    // 创建一个简单的纯色绿色 PNG
    const zlib = require('zlib');

    // IHDR chunk
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;  // bit depth
    ihdr[9] = 2;  // color type (RGB)
    ihdr[10] = 0; // compression
    ihdr[11] = 0; // filter
    ihdr[12] = 0; // interlace

    // Image data: each row has filter byte + RGB data
    const rowSize = 1 + width * 3; // filter byte + RGB
    const rawData = Buffer.alloc(rowSize * height);

    for (let y = 0; y < height; y++) {
      const rowOffset = y * rowSize;
      rawData[rowOffset] = 0; // no filter
      for (let x = 0; x < width; x++) {
        const pixelOffset = rowOffset + 1 + x * 3;
        // 绿色渐变圆形效果
        const cx = x - 7.5;
        const cy = y - 7.5;
        const dist = Math.sqrt(cx * cx + cy * cy);
        if (dist < 6) {
          rawData[pixelOffset] = 50;      // R
          rawData[pixelOffset + 1] = 205;  // G
          rawData[pixelOffset + 2] = 50;   // B
        } else if (dist < 8) {
          rawData[pixelOffset] = 34;
          rawData[pixelOffset + 1] = 139;
          rawData[pixelOffset + 2] = 34;
        } else {
          rawData[pixelOffset] = 0;
          rawData[pixelOffset + 1] = 100;
          rawData[pixelOffset + 2] = 0;
        }
      }
    }

    const compressed = zlib.deflateSync(rawData);

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
