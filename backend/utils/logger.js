const log = (level, message, data = {}) => {
  console.log(`[${new Date().toISOString()}] [${level}] ${message}`, data);
};

export const logger = {
  info: (msg, data) => log('INFO', msg, data),
  error: (msg, data) => log('ERROR', msg, data),
  warn: (msg, data) => log('WARN', msg, data),
  debug: (msg, data) => log('DEBUG', msg, data)
};

export default logger;
