import { LogLevel } from "./LogLevel";

export interface Logger {
  log(level: LogLevel, message: string, context?: unknown): void;

  debug(message: string, context?: unknown): void;

  info(message: string, context?: unknown): void;

  warn(message: string, context?: unknown): void;

  error(message: string, context?: unknown): void;
}