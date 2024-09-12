import winston, { format } from 'winston';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

const excludeStreaming = format((info, opts) => {
  if (info.message && info.message.includes('data:{"type":"llm","text":')) {
    return false;
  }
  return info;
});

const formatObject = (obj) => {
  if (typeof obj === 'object' && obj !== null) {
    return JSON.stringify(obj, null, 2);
  }
  return obj;
};

const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    excludeStreaming(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.printf(({ timestamp, level, message, ...metadata }) => {
      let msg = `${timestamp} [${level}]: ${formatObject(message)}`;
      if (Object.keys(metadata).length > 0) {
        msg += ` ${formatObject(metadata)}`;
      }
      return msg;
    })
  ),
  transports: []
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));

  logger.add(new winston.transports.File({ 
    filename: 'error.log', 
    level: 'error'
  }));

  logger.add(new winston.transports.File({ 
    filename: 'combined.log'
  }));
}

logger.step = (stepNumber, data) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`Step ${stepNumber}: ${formatObject(data)}`);
  }
};

export default logger;
