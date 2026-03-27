class Logger {
    constructor() { }
    debug(system, message) {
        console.debug(`[DEBUG]: ${system} - ${message}`);
    }
    info(system, message) {
        console.info(`[INFO]: ${system} - ${message}`);
    }
    warn(system, message) {
        console.warn(`[WARN]: ${system} - ${message}`);
    }
    err(system, message) {
        console.error(`[ERROR]: ${system} - ${message}`);
    }
}
export const LOGGER = new Logger();
