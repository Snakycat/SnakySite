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
enum ServerStatus {
  Online = "Online",
  Offline = "Offline",
  Pending = "Pending",
}

/**
 * The url of a particular server mirror and everything necessary to track its status
 */
class ServerUrl {
  url: string;
  indicator: Optional<HTMLElement>;
  status: ServerStatus;

  constructor(url: string, indicator_id: string) {
    this.url = url;
    this.indicator = Optional.from_nullable(
      document.getElementById(indicator_id),
    );
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
        this.indicator.inspect(
          ServerStatusHelper.set_status_color(this.status),
        );
      })
      // Fetch Failed
      .catch((err) => {
        LOGGER.warn(
          "Status Tracker",
          `Failed to update the status of ${this.url}\n\n\tReason: ${err}`,
        );
        this.status = ServerStatus.Offline;

        // Display status
        this.indicator.inspect(
          ServerStatusHelper.set_status_color(this.status),
        );
      });
  }
}

/**
 * A collection of urls that point to the same server
 */
class Server {
  name: string;
  urls: ServerUrl[];

  constructor(name: string, urls: ServerUrl[]) {
    this.name = name;
    this.urls = urls;
  }

  update_status() {
    for (let url of this.urls) {
      url.update_status();
    }
  }
}

// --------------------
// Configuration
// --------------------

type ConfigJSON = {
  readonly status_button_id: string;
  readonly update_interval_seconds: number;
  readonly servers: {
    readonly [key: string]: {
      readonly url: string;
      readonly status_id: string;
    }[];
  };
};

class Config {
  readonly status_button_id: string;
  readonly update_interval_seconds: number;
  readonly servers: Server[];

  private constructor(
    status_button_id: string,
    update_interval_seconds: number,
    servers: Server[],
  ) {
    this.status_button_id = status_button_id;
    this.update_interval_seconds = update_interval_seconds;
    this.servers = servers;
  }

  static async from_fetch_file(path: string): Promise<Config> {
    let request = await fetch(path);
    let json = (await request.json()) as ConfigJSON;

    console.log(json);

    let servers = [];

    for (let name in json.servers) {
      let urls = [];
      for (let { url, status_id } of json.servers[name]) {
        urls.push(new ServerUrl(url, status_id));
      }
      servers.push(new Server(name, urls));
    }

    return new Config(
      json.status_button_id,
      json.update_interval_seconds,
      servers,
    );
  }
}

// --------------------
// Functions
// --------------------

export function init_status_tracker() {
  init_status_tracker_async().catch((err) => {
    LOGGER.err(
      "Status Tracker",
      `Failed to initialize status tracker, status tracker disabled!\n\nReason: ${err}`,
    );
  });
}

async function init_status_tracker_async() {
  LOGGER.info("Status Tracker", "Initializing...");

  LOGGER.trace("Status Tracker", "Loading config file...");
  let config = await Config.from_fetch_file("config/status_tracker.json");

  LOGGER.trace("Status Tracker", "Performing initial check...");
  update_server_statuses(config.servers);

  LOGGER.trace("Status Tracker", "Starting up automatic timer...");
  setInterval(
    update_server_statuses,
    config.update_interval_seconds * 1000,
    config.servers,
  );

  LOGGER.trace("Status Tracker", "Enabling the manual check button...");
  let status_button = Optional.from_nullable(
    document.getElementById(config.status_button_id),
  );
  status_button.inspect((btn) => {
    btn.onclick = () => {
      update_server_statuses(config.servers);
    };
  });

  LOGGER.info("Status Tracker", "Initialized!");
}

function update_server_statuses(servers: Server[]) {
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
  static set_pending(elem: HTMLElement) {
    elem.style.backgroundColor = ServerStatusHelper.to_css_color(
      ServerStatus.Pending,
    );
  }

  static set_status_color(status: ServerStatus): (elem: HTMLElement) => void {
    return (elem) => {
      elem.style.backgroundColor = ServerStatusHelper.to_css_color(status);
    };
  }

  static to_css_color(status: ServerStatus): string {
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
