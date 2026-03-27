var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Error"] = 0] = "Error";
    LogLevel[LogLevel["Warn"] = 1] = "Warn";
    LogLevel[LogLevel["Info"] = 2] = "Info";
    LogLevel[LogLevel["Debug"] = 3] = "Debug";
    LogLevel[LogLevel["Trace"] = 4] = "Trace";
})(LogLevel || (LogLevel = {}));
class Logger {
    constructor(log_level) {
        this.log_level = log_level;
    }
    trace(system, message) {
        if (this.log_level >= LogLevel.Trace) {
            console.log(`[TRACE]: ${system} - ${message}`);
        }
    }
    debug(system, message) {
        if (this.log_level >= LogLevel.Debug) {
            console.debug(`[DEBUG]: ${system} - ${message}`);
        }
    }
    info(system, message) {
        if (this.log_level >= LogLevel.Info) {
            console.info(`[INFO]: ${system} - ${message}`);
        }
    }
    warn(system, message) {
        if (this.log_level >= LogLevel.Warn) {
            console.warn(`[WARN]: ${system} - ${message}`);
        }
    }
    err(system, message) {
        if (this.log_level >= LogLevel.Error) {
            console.error(`[ERROR]: ${system} - ${message}`);
        }
    }
}
// TODO: make logger init function and then move the log level to config
export const LOGGER = new Logger(LogLevel.Trace);
