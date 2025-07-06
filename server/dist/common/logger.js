"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
// logger.ts
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const lru_cache_1 = require("lru-cache"); // Install using `npm install lru-cache`
/**
 * A custom logger class that wraps the Winston logging library for structured logging.
 */
class Logger {
    /**
     * Creates an instance of the Logger class.
     * Ensures the log directory exists and initializes the logger with specified options.
     *
     * @param {LoggerOptions} [options] - Configuration options for the logger.
     * @param {string} [options.service] - The name of the service using the logger.
     * @param {string} [options.level] - The logging level (e.g., 'info', 'debug').
     * @param {string} [options.logDir] - The directory where log files will be stored.
     * @param {boolean} [options.silent] - Whether to suppress logging output.
     */
    constructor(options = {}) {
        // Initialize rate limiter with a time-to-live (TTL) for log entries
        this.rateLimiter = new lru_cache_1.LRUCache({
            max: 1000, // Maximum number of unique log entries to track
            ttl: 1000 * 60 // Time-to-live for each log entry (e.g., 1 minute)
        });
        const { level = process.env.NODE_ENV === 'production' ? 'info' : 'debug', logDir = 'logs', silent = process.env.NODE_ENV === 'test' } = options;
        // Ensure log directory exists
        if (!fs_1.default.existsSync(logDir)) {
            fs_1.default.mkdirSync(logDir, { recursive: true });
        }
        const combinedLogPath = process.env.COMBINED_LOG_PATH || path_1.default.join(logDir, 'combined.log');
        const errorLogPath = process.env.ERROR_LOG_PATH || path_1.default.join(logDir, 'error.log');
        const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf((_a) => {
            var { timestamp, level, message } = _a, meta = __rest(_a, ["timestamp", "level", "message"]);
            // Sanitize sensitive data
            if (meta && meta.password) {
                meta.password = '***';
            }
            return `${timestamp} [${level.toUpperCase()}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        }));
        try {
            this.logger = winston_1.default.createLogger({
                level,
                format: logFormat,
                transports: [
                    new winston_1.default.transports.Console({
                        format: winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf((info) => `[${info.timestamp}] [${info.level}]:${info.message}`)),
                        level: 'info'
                    }),
                    new winston_1.default.transports.File({
                        filename: combinedLogPath,
                        level: 'info'
                    }),
                    new winston_1.default.transports.File({
                        filename: errorLogPath,
                        level: 'error'
                    })
                ],
                silent
            });
        }
        catch (error) {
            console.error('Failed to initialize logger:', error);
        }
    }
    /**
     * Logs a message with rate limiting.
     *
     * @param {string} level - The log level (e.g., 'info', 'error', 'debug').
     * @param {string} message - The log message.
     * @param {unknown} [meta] - Additional metadata to include with the log.
     */
    rateLimitedLog(level, message, meta) {
        const logKey = `${level}:${message}`; // Unique key for the log entry
        // Check if the log entry is rate-limited
        if (this.rateLimiter.has(logKey)) {
            return; // Skip logging if the message is rate-limited
        }
        // Add the log entry to the rate limiter
        this.rateLimiter.set(logKey, 1);
        // Log the message
        this.logger.log(level, message, meta);
    }
    /**
     * Logs the start of a function or process with contextual information.
     *
     * @param {string | Function | Record<string, unknown>} functionName - The name of the function or process.
     * @param {string | Record<string, unknown>} [className] - The name of the class or object containing the function.
     * @param {string} [fileName] - The name of the file where the function is located.
     */
    start(functionName, className, fileName) {
        var _a, _b;
        try {
            // Get function name
            let funName = '';
            if (arguments.length >= 1) {
                switch (typeof functionName) {
                    case 'function':
                        funName = functionName.name;
                        break;
                    case 'string':
                        funName = functionName;
                        break;
                    default:
                        funName = '';
                }
            }
            // Get class name
            let clsName = '';
            if (arguments.length >= 2) {
                switch (typeof className) {
                    case 'string':
                        clsName = className;
                        break;
                    case 'object':
                        if (className !== null && className.constructor !== undefined) {
                            clsName = className.constructor.name;
                        }
                        else {
                            clsName = '';
                        }
                        break;
                    default:
                        clsName = '';
                }
            }
            // Print start log
            if (arguments.length >= 3) {
                this.logger.info(`${fileName} : ${clsName} : [${(_a = funName.replace(/bound /, '')) === null || _a === void 0 ? void 0 : _a.toLocaleUpperCase()}]    start ===>`);
            }
            else if (arguments.length == 2) {
                this.logger.info(`[${clsName}.ts] : [${funName.replace(/bound /, '')}()]    start ===>`);
            }
            else {
                this.logger.info(`[${(_b = funName.replace(/bound /, '')) === null || _b === void 0 ? void 0 : _b.toLocaleUpperCase()}]    start ===>`);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(error.stack);
            }
            else {
                console.error('An unknown error occurred:', error);
            }
        }
    }
    /**
     * Logs an informational message with rate limiting.
     *
     * @param {string} message - The message to log.
     * @param {unknown} [meta] - Additional metadata to include with the log.
     */
    info(message, meta) {
        this.rateLimitedLog('info', message, meta);
    }
    /**
     * Logs an error message with rate limiting.
     *
     * @param {string} message - The error message to log.
     * @param {unknown} [meta] - Additional metadata to include with the log.
     */
    error(message, meta) {
        this.rateLimitedLog('error', message, meta);
    }
    /**
     * Logs a debug message with rate limiting.
     *
     * @param {string} message - The debug message to log.
     * @param {unknown} [meta] - Additional metadata to include with the log.
     */
    debug(message, meta) {
        this.rateLimitedLog('debug', message, meta);
    }
    /**
     * Logs a warning message with rate limiting.
     *
     * @param {string} message - The warning message to log.
     * @param {unknown} [meta] - Additional metadata to include with the log.
     */
    warn(message, meta) {
        this.rateLimitedLog('warn', message, meta);
    }
    /**
     * Updates the logging level of the logger.
     *
     * @param {string} level - The new logging level to set.
     */
    updateLogLevel(level) {
        this.logger.level = level;
    }
    /**
     * Provides access to the underlying Winston logger instance.
     *
     * @returns {winston.Logger} The Winston logger instance.
     */
    get instance() {
        return this.logger;
    }
}
exports.Logger = Logger;
const logger = new Logger();
Object.freeze(logger);
exports.default = logger;
