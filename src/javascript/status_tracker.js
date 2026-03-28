// --------------------
// Imports
// --------------------
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { LOGGER } from "./log.js";
import { Optional } from "./util.js";
// --------------------
// Type Definitions
// --------------------
/**
 * The possible netowrk statuses of a server on a particular url
 */
var ServerStatus;
(function (ServerStatus) {
    ServerStatus["Online"] = "Online";
    ServerStatus["Offline"] = "Offline";
    ServerStatus["Pending"] = "Pending";
})(ServerStatus || (ServerStatus = {}));
/**
 * The url of a particular server mirror and everything necessary to track its status
 */
class ServerUrl {
    constructor(url, indicator_id) {
        this.url = url;
        this.indicator = Optional.from_nullable(document.getElementById(indicator_id));
        this.status = ServerStatus.Pending;
    }
    update_status() {
        // Initialize status display to pending
        this.indicator.inspect(ServerStatusHelper.set_pending);
        // If fetch succeeds, then update the status indicator based on the status of the response
        // otherwise if fetch fails then set the status to offline and log why the fetch failed
        const response = fetch(this.url, {
            mode: "no-cors",
        });
        response
            // Fetch Succeeded
            .then((value) => {
            LOGGER.trace("Status Tracker", `Updating status of ${this.url}`);
            // Determine status
            this.status =
                value.status < 400 ? ServerStatus.Online : ServerStatus.Offline;
            // Display status
            this.indicator.inspect(ServerStatusHelper.set_status_color(this.status));
        })
            // Fetch Failed
            .catch((err) => {
            LOGGER.warn("Status Tracker", `Failed to update the status of ${this.url}\n\n\tReason: ${err}`);
            this.status = ServerStatus.Offline;
            // Display status
            this.indicator.inspect(ServerStatusHelper.set_status_color(this.status));
        });
    }
}
/**
 * A collection of urls that point to the same server
 */
class Server {
    constructor(name, urls) {
        this.name = name;
        this.urls = urls;
    }
    update_status() {
        for (let url of this.urls) {
            url.update_status();
        }
    }
}
class Config {
    constructor(status_button_id, update_interval_seconds, servers) {
        this.status_button_id = status_button_id;
        this.update_interval_seconds = update_interval_seconds;
        this.servers = servers;
    }
    static from_fetch_file(path) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = yield fetch(path);
            let json = (yield request.json());
            console.log(json);
            let servers = [];
            for (let name in json.servers) {
                let urls = [];
                for (let { url, status_id } of json.servers[name]) {
                    urls.push(new ServerUrl(url, status_id));
                }
                servers.push(new Server(name, urls));
            }
            return new Config(json.status_button_id, json.update_interval_seconds, servers);
        });
    }
}
// --------------------
// Functions
// --------------------
export function init_status_tracker() {
    init_status_tracker_async().catch((err) => {
        LOGGER.err("Status Tracker", `Failed to initialize status tracker, status tracker disabled!\n\nReason: ${err}`);
    });
}
function init_status_tracker_async() {
    return __awaiter(this, void 0, void 0, function* () {
        LOGGER.info("Status Tracker", "Initializing...");
        LOGGER.trace("Status Tracker", "Loading config file...");
        let config = yield Config.from_fetch_file("config/status_tracker.json");
        LOGGER.trace("Status Tracker", "Performing initial check...");
        update_server_statuses(config.servers);
        LOGGER.trace("Status Tracker", "Starting up automatic timer...");
        setInterval(update_server_statuses, config.update_interval_seconds * 1000, config.servers);
        LOGGER.trace("Status Tracker", "Enabling the manual check button...");
        let status_button = Optional.from_nullable(document.getElementById(config.status_button_id));
        status_button.inspect((btn) => {
            btn.onclick = () => {
                update_server_statuses(config.servers);
            };
        });
        LOGGER.info("Status Tracker", "Initialized!");
    });
}
function update_server_statuses(servers) {
    LOGGER.info("Status Tracker", "Checking server statuses...");
    for (let server of servers) {
        LOGGER.info("Status Tracker", `Checking status of ${server.name}`);
        server.update_status();
    }
}
// --------------------
// Helpers
// --------------------
class ServerStatusHelper {
    static set_pending(elem) {
        elem.style.backgroundColor = ServerStatusHelper.to_css_color(ServerStatus.Pending);
    }
    static set_status_color(status) {
        return (elem) => {
            elem.style.backgroundColor = ServerStatusHelper.to_css_color(status);
        };
    }
    static to_css_color(status) {
        let offline_color = window
            .getComputedStyle(document.body)
            .getPropertyValue("--status-offline-color");
        let online_color = window
            .getComputedStyle(document.body)
            .getPropertyValue("--status-online-color");
        let pending_color = window
            .getComputedStyle(document.body)
            .getPropertyValue("--status-pending-color");
        if (offline_color === "") {
            offline_color = "red";
        }
        if (online_color === "") {
            online_color = "green";
        }
        if (pending_color === "") {
            pending_color = "gold";
        }
        switch (status) {
            case ServerStatus.Offline: {
                return offline_color;
            }
            case ServerStatus.Online: {
                return online_color;
            }
            case ServerStatus.Pending: {
                return pending_color;
            }
        }
    }
}
