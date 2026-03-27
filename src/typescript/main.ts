// --------------------
// Imports
// --------------------

// import { LOGGER } from "./log.js";
import { init_logger, LogLevel } from "./log.js";
import { init_status_tracker } from "./status_tracker.js";

// --------------------
// Entry Point
// --------------------

function main() {
  init_logger(LogLevel.Trace);
  init_status_tracker();
}

// --------------------
// Bootstrap Entrypoint
// --------------------
window.addEventListener("load", main);
