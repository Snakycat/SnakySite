enum LogLevel {
  Error = 0,
  Warn = 1,
  Info = 2,
  Debug = 3,
  Trace = 4,
}

class Logger {
  private log_level: LogLevel;

  constructor(log_level: LogLevel) {
    this.log_level = log_level;
  }

  trace(system: string, message: string) {
    if (this.log_level >= LogLevel.Trace) {
      console.log(`[TRACE]: ${system} - ${message}`);
    }
  }

  debug(system: string, message: string) {
    if (this.log_level >= LogLevel.Debug) {
      console.debug(`[DEBUG]: ${system} - ${message}`);
    }
  }

  info(system: string, message: string) {
    if (this.log_level >= LogLevel.Info) {
      console.info(`[INFO]: ${system} - ${message}`);
    }
  }

  warn(system: string, message: string) {
    if (this.log_level >= LogLevel.Warn) {
      console.warn(`[WARN]: ${system} - ${message}`);
    }
  }

  err(system: string, message: string) {
    if (this.log_level >= LogLevel.Error) {
      console.error(`[ERROR]: ${system} - ${message}`);
    }
  }
}

// TODO: make logger init function and then move the log level to config
export const LOGGER = new Logger(LogLevel.Trace);
