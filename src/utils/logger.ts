import { Request, Response, NextFunction } from 'express';

enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Logger utility class for structured logging at various levels (info, warn, error, debug).
 */
export class Logger {
  private static formatMessage(logMessage: LogMessage): string {
    const { level, message, timestamp, metadata } = logMessage;
    const metadataStr = metadata ? ` | metadata: ${JSON.stringify(metadata)}` : '';
    return `[${timestamp}] ${level}: ${message}${metadataStr}`;
  }

  static info(message: string, metadata?: Record<string, any>) {
    const logMessage = {
      level: LogLevel.INFO,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };
    console.log(this.formatMessage(logMessage));
  }

  static warn(message: string, metadata?: Record<string, any>) {
    const logMessage = {
      level: LogLevel.WARN,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };
    console.warn(this.formatMessage(logMessage));
  }

  static error(message: string, error?: Error, metadata?: Record<string, any>) {
    const logMessage = {
      level: LogLevel.ERROR,
      message: `${message} | ${error?.stack || error?.message || 'Unknown error'}`,
      timestamp: new Date().toISOString(),
      metadata,
    };
    console.error(this.formatMessage(logMessage));
  }

  static debug(message: string, metadata?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = {
        level: LogLevel.DEBUG,
        message,
        timestamp: new Date().toISOString(),
        metadata,
      };
      console.debug(this.formatMessage(logMessage));
    }
  }
}

/**
 * Express middleware to log all incoming requests and their response status/duration.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logMessage = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    };

    if (res.statusCode >= 400) {
      Logger.error('Request failed', undefined, logMessage);
    } else {
      Logger.info('Request completed', logMessage);
    }
  });

  next();
};

/**
 * Express error-handling middleware to log unhandled errors with request context.
 */
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  Logger.error('Unhandled error', error, {
    method: req.method,
    path: req.path,
    body: req.body,
    query: req.query,
    ip: req.ip,
  });

  next(error);
};
