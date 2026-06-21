/**
 * AppLogger.js
 * In-memory logger for tracking calculations, execution warnings, and UI faults.
 * Exposed via window.AppLogger for debug and System Health dashboards.
 */
class AppLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 500;
    this.crashCount = 0;
  }

  log(level, message, context = {}, error = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level, // 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
      message,
      context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null
    };

    this.logs.unshift(logEntry); // Keep newest logs first

    // Limit memory footprint
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    if (level === 'FATAL' || level === 'ERROR') {
      this.crashCount++;
    }

    // Also output to dev console for convenience
    if (level === 'ERROR' || level === 'FATAL') {
      console.error(`[${timestamp}] [${level}] ${message}`, context, error);
    } else if (level === 'WARN') {
      console.warn(`[${timestamp}] [${level}] ${message}`, context);
    } else {
      console.log(`[${timestamp}] [${level}] ${message}`, context);
    }
  }

  info(message, context = {}) {
    this.log('INFO', message, context);
  }

  warn(message, context = {}) {
    this.log('WARN', message, context);
  }

  error(message, context = {}, error = null) {
    this.log('ERROR', message, context, error);
  }

  fatal(message, context = {}, error = null) {
    this.log('FATAL', message, context, error);
  }

  getLogs() {
    return this.logs;
  }

  getStats() {
    return {
      total: this.logs.length,
      info: this.logs.filter(l => l.level === 'INFO').length,
      warn: this.logs.filter(l => l.level === 'WARN').length,
      error: this.logs.filter(l => l.level === 'ERROR').length,
      fatal: this.logs.filter(l => l.level === 'FATAL').length,
      crashCount: this.crashCount
    };
  }

  clear() {
    this.logs = [];
    this.crashCount = 0;
  }
}

// Singleton pattern
const loggerInstance = new AppLogger();

if (typeof window !== 'undefined') {
  window.AppLogger = loggerInstance;
}

export default loggerInstance;
