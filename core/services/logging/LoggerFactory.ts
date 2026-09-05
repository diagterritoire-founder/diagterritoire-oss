import { ConsoleLogger } from "./ConsoleLogger";
import type { Logger } from "./Logger";

export class LoggerFactory {

  private static logger: Logger;

  static getLogger(): Logger {

    if (!this.logger) {

      this.logger = new ConsoleLogger();

    }

    return this.logger;
  }
}