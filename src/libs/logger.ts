import { createLogger, format, transports } from 'winston';

const __transports = [];

if (process.env.NODE_ENV === 'development') {
  __transports.push(
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
    
  );
} else {
  // __transports.push(new transports.Console());
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}] ${message}`)
  ),
  transports: __transports,
});

export default logger;
