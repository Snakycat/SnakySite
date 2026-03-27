// --------------------
// Imports
// --------------------
import { LOGGER } from "./log.js";
// --------------------
// Entry Point
// --------------------
function main() {
    LOGGER.debug("MAIN", "Hello, Typescript!");
    LOGGER.info("MAIN", "Hello, Typescript!");
    LOGGER.warn("MAIN", "Hello, Typescript!");
    LOGGER.err("MAIN", "Hello, Typescript!");
}
// --------------------
// Bootstrap Entrypoint
// --------------------
window.addEventListener("load", main);
