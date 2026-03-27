class Logger {
  constructor() {}

  debug(system: string, message: string) {
    console.debug(`[DEBUG]: ${system} - ${message}`);
  }

  info(system: string, message: string) {
    console.info(`[INFO]: ${system} - ${message}`);
  }

  warn(system: string, message: string) {
    console.warn(`[WARN]: ${system} - ${message}`);
  }

  err(system: string, message: string) {
    console.error(`[ERROR]: ${system} - ${message}`);
  }
}

export const LOGGER = new Logger();
