import { Logger } from "./Logger";
import { LogLevel } from "./LogLevel";

export class ConsoleLogger implements Logger {

  log(level: LogLevel, message: string, context?: unknown): void {

    const timestamp = new Date().toISOString();

    console.log(
      `[${timestamp}] [${level}] ${message}`,
      context ?? ""
    );
  }

  debug(message: string, context?: unknown): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: unknown): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: unknown): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: unknown): void {
    this.log(LogLevel.ERROR, message, context);
  }
}