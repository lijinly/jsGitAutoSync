const winston = require('winston');
const path = require('path');

const logsDir = path.join(process.cwd(), 'logs');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.timestamp({ format: 'HH:mm:ss' }), winston.format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`)) }),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'sync.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

module.exports = logger;
