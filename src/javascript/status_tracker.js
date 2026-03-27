// --------------------
// Imports
// --------------------
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
    constructor(urls) {
        this.urls = urls;
    }
    update_status() {
        for (let url of this.urls) {
            url.update_status();
        }
    }
}
export function init_status_tracker() {
    // TODO
    //  - Move timer interval to config
    //  - Move status button id to config
    LOGGER.info("Status Tracker", "Initializing...");
    const SERVERS = [
        // Jellyfin
        new Server([
            new ServerUrl("https://jellyfin.snakycat.uk/", "status-jellyfin"),
            new ServerUrl("https://snakycat-jellyfin.duckdns.org/", "status-jellyfin_mirror"),
        ]),
        // Jellyseerr
        new Server([
            new ServerUrl("https://jellyseerr.snakycat.uk/login", "status-jellyseerr"),
            new ServerUrl("https://snakycat-jelly2.duckdns.org/", "status-jellyseerr_mirror"),
        ]),
        // Audiobookshelf
        new Server([
            new ServerUrl("https://audiobook.snakycat.uk/", "status-abs"),
            new ServerUrl("https://snakycat-abs.duckdns.org/audiobookshelf/login", "status-abs_mirror"),
        ]),
        // Navidrome
        new Server([
            new ServerUrl("https://music.snakycat.uk/", "status-navidrome"),
        ]),
    ];
    LOGGER.trace("Status Tracker", "Performing initial check...");
    update_server_statuses(SERVERS);
    LOGGER.trace("Status Tracker", "Starting up automatic timer...");
    setInterval(update_server_statuses, 300000, SERVERS);
    LOGGER.trace("Status Tracker", "Enabling the manual check button...");
    // TODO: make more robust
    document.getElementById("check-status-btn").onclick = () => {
        update_server_statuses(SERVERS);
    };
    LOGGER.info("Status Tracker", "Initialized!");
}
function update_server_statuses(servers) {
    LOGGER.info("Status Tracker", "Checking server statuses...");
    for (let server of servers) {
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
