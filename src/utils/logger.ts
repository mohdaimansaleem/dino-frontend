/**
 * Production-Safe Logging System
 * 
 * Provides conditional logging based on environment and configuration.
 * In production, only errors and warnings are logged unless explicitly enabled.
 */

import { getConfigValue, isProduction } from '../config/runtime';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private enableConsoleLogging: boolean = false;

  constructor() {
    this.updateConfig();
  }

  private updateConfig(): void {
    const configLogLevel = getConfigValue('LOG_LEVEL').toLowerCase();
    this.enableConsoleLogging = getConfigValue('ENABLE_CONSOLE_LOGGING');

    // Map string log level to enum
    switch (configLogLevel) {
      case 'error':
        this.logLevel = LogLevel.ERROR;
        break;
      case 'warn':
        this.logLevel = LogLevel.WARN;
        break;
      case 'info':
        this.logLevel = LogLevel.INFO;
        break;
      case 'debug':
        this.logLevel = LogLevel.DEBUG;
        break;
      default:
        this.logLevel = isProduction() ? LogLevel.WARN : LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    // Always allow errors
    if (level === LogLevel.ERROR) return true;
    
    // In production, only log if explicitly enabled
    if (isProduction() && !this.enableConsoleLogging) {
      return level <= LogLevel.WARN;
    }
    
    // In development, respect log level
    return level <= this.logLevel;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    
    return `${prefix} ${message}`;
  }

  error(message: string, error?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage('ERROR', message);
      console.error(formattedMessage, error || '');
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage('WARN', message, data);
      console.warn(formattedMessage);
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage('INFO', message, data);
      console.log(formattedMessage);
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage('DEBUG', message, data);
      console.log(formattedMessage);
    }
  }

  // Convenience methods for common use cases
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method.toUpperCase()} ${url}`, data);
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    this.debug(`API Response: ${method.toUpperCase()} ${url} [${status}]`, data);
  }

  apiError(method: string, url: string, error: any): void {
    this.error(`API Error: ${method.toUpperCase()} ${url}`, error);
  }

  authEvent(event: string, data?: any): void {
    this.info(`Auth: ${event}`, data);
  }

  configEvent(event: string, data?: any): void {
    this.info(`Config: ${event}`, data);
  }

  // Group logging for better organization
  group(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.groupEnd();
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logError = (message: string, error?: any) => logger.error(message, error);
export const logWarn = (message: string, data?: any) => logger.warn(message, data);
export const logInfo = (message: string, data?: any) => logger.info(message, data);
export const logDebug = (message: string, data?: any) => logger.debug(message, data);

export default logger;