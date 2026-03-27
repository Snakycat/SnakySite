// --------------------
// Imports
// --------------------
import { LOGGER } from "./log.js";
import { Optional } from "./util.js";
// --------------------
// Type Definitions
// --------------------
var ServerStatus;
(function (ServerStatus) {
    ServerStatus["Online"] = "Online";
    ServerStatus["Offline"] = "Offline";
    ServerStatus["Pending"] = "Pending";
})(ServerStatus || (ServerStatus = {}));
class ServerUrl {
    constructor(url, indicator_id) {
        this.url = url;
        this.indicator_id = indicator_id;
        this.status = ServerStatus.Pending;
    }
    update_status() {
        let indicator = document.getElementById(this.indicator_id);
        if (indicator !== null) {
            indicator.style.backgroundColor = server_status_to_css_color(ServerStatus.Pending);
        }
        // TODO: Improve clarity
        try {
            const response = fetch(this.url, {
                mode: "no-cors",
            });
            response.then((value) => {
                LOGGER.trace("Status Tracker", `Updating status of ${this.url}`);
                if (value.status < 400) {
                    this.status = ServerStatus.Online;
                }
                else {
                    this.status = ServerStatus.Offline;
                }
                if (indicator !== null) {
                    indicator.style.backgroundColor = server_status_to_css_color(this.status);
                }
            });
        }
        catch (err) {
            LOGGER.warn("Status Tracker", `Failed to update the status of ${this.url}\n\n\tReason: ${err}`);
            this.status = ServerStatus.Offline;
            if (indicator !== null) {
                indicator.style.backgroundColor = server_status_to_css_color(this.status);
            }
        }
    }
}
class Server {
    constructor(main_url, mirror_url) {
        this.main_url = Optional.from_nullable(main_url);
        this.mirror_url = Optional.from_nullable(mirror_url);
    }
    update_status() {
        this.main_url.inspect((url) => {
            url.update_status();
        });
        this.mirror_url.inspect((url) => {
            url.update_status();
        });
    }
}
export function init_status_tracker() {
    // TODO
    //  - Move timer interval to config
    //  - Move status button id to config
    //  - Perform null check on element getters
    LOGGER.info("Status Tracker", "Initializing...");
    const SERVERS = [
        // Jellyfin
        new Server(new ServerUrl("https://jellyfin.snakycat.uk/", "status-jellyfin"), new ServerUrl("https://snakycat-jellyfin.duckdns.org/", "status-jellyfin_mirror")),
        // Jellyseerr
        new Server(new ServerUrl("https://jellyseerr.snakycat.uk/login", "status-jellyseerr"), new ServerUrl("https://snakycat-jelly2.duckdns.org/", "status-jellyseerr_mirror")),
        // Audiobookshelf
        new Server(new ServerUrl("https://audiobook.snakycat.uk/", "status-abs"), new ServerUrl("https://snakycat-abs.duckdns.org/audiobookshelf/login", "status-abs_mirror")),
        // Navidrome
        new Server(new ServerUrl("https://music.snakycat.uk/", "status-navidrome"), null),
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
function server_status_to_css_color(status) {
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
