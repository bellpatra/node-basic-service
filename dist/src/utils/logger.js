"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.requestLogger = exports.Logger = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (LogLevel = {}));
/**
 * Logger utility class for structured logging at various levels (info, warn, error, debug).
 */
class Logger {
    static formatMessage(logMessage) {
        const { level, message, timestamp, metadata } = logMessage;
        const metadataStr = metadata ? ` | metadata: ${JSON.stringify(metadata)}` : '';
        return `[${timestamp}] ${level}: ${message}${metadataStr}`;
    }
    static info(message, metadata) {
        const logMessage = {
            level: LogLevel.INFO,
            message,
            timestamp: new Date().toISOString(),
            metadata,
        };
        console.log(this.formatMessage(logMessage));
    }
    static warn(message, metadata) {
        const logMessage = {
            level: LogLevel.WARN,
            message,
            timestamp: new Date().toISOString(),
            metadata,
        };
        console.warn(this.formatMessage(logMessage));
    }
    static error(message, error, metadata) {
        const logMessage = {
            level: LogLevel.ERROR,
            message: `${message} | ${(error === null || error === void 0 ? void 0 : error.stack) || (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`,
            timestamp: new Date().toISOString(),
            metadata,
        };
        console.error(this.formatMessage(logMessage));
    }
    static debug(message, metadata) {
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
exports.Logger = Logger;
/**
 * Express middleware to log all incoming requests and their response status/duration.
 */
const requestLogger = (req, res, next) => {
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
        }
        else {
            Logger.info('Request completed', logMessage);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
/**
 * Express error-handling middleware to log unhandled errors with request context.
 */
const errorLogger = (error, req, res, next) => {
    Logger.error('Unhandled error', error, {
        method: req.method,
        path: req.path,
        body: req.body,
        query: req.query,
        ip: req.ip,
    });
    next(error);
};
exports.errorLogger = errorLogger;
