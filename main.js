// --------------------
// Explaination
// --------------------

// # OPERATION OVERVIEW
//
// When the website loads, the initial status of the servers is checked and
// the automatic timer and manual button are activated.
//
// To check the status of the servers, a fetch request is sent to the urls
// of each server and if the response has a 2XX status code the server is
// considered online.

// # CONFIGURATION GUIDE
//
// STATUS_INTERVAL_SECONDS - The number of seconds between each automatic status check
//
// !!!IMPORTANT!!!: The color variables are now set using the values from style.css.
//
// ONLINE_STATUS_COLOR - The CSS colour of the status indicators when their respective
//                       server is online
//
// OFFLINE_STATUS_COLOR - The CSS colour of the status indicators when their respective
//                        server is offline
//
// PENDING_STATUS_COLOR - The CSS colour of the status indicators when their respective
//                        server is still being processed
//
// SERVERS - The list of servers to check.
//           1st Argument: Primary server url (or null if there isnt one)
//           2nd Argument: Mirror server url (or null if there isnt one)
//           3rd Argument: Element id of the primary status indicator (or null if there isnt one)
//           4th Argument: Element id of the mirror status indicator (or null if there isnt one)

// --------------------
// Class Definitions
// --------------------

// Contains the urls and status indicator element ids of a server
class Server {
  constructor(main_url, mirror_url, main_indicator_id, mirror_indicator_id) {
    this.main_url = main_url;
    this.mirror_url = mirror_url;
    this.main_indicator_id = main_indicator_id;
    this.mirror_indicator_id = mirror_indicator_id;
  }
}

// Contains the statuses of the various urls of a server (stored as booleans)
// true: online
// false: offline
class ServerStatus {
  constructor(main_status, mirror_status) {
    this.main_status = main_status;
    this.mirror_status = mirror_status;
  }
}

// --------------------
// Configuration
// --------------------

// The interval between each automatic status check
const STATUS_INTERVAL_SECONDS = 300; // 5 Minutes

// The colors for the status indicators (THESE ARE NOW NABBED FROM THE CSS, DO NOT EDIT THEM)
const ONLINE_STATUS_COLOR = window
  .getComputedStyle(document.body)
  .getPropertyValue("--status-online-color");
const OFFLINE_STATUS_COLOR = window
  .getComputedStyle(document.body)
  .getPropertyValue("--status-offline-color");

const PENDING_STATUS_COLOR = window
  .getComputedStyle(document.body)
  .getPropertyValue("--status-pending-color");

// The list of servers to status check
const SERVERS = [
  // Jellyfin
  new Server(
    "https://jellyfin.snakycat.uk/",
    "https://snakycat-jellyfin.duckdns.org/",
    "status-jellyfin",
    "status-jellyfin_mirror",
  ),
  // Jellyseerr
  new Server(
    "https://jellyseerr.snakycat.uk/login",
    "https://snakycat-jelly2.duckdns.org/",
    "status-jellyseerr",
    "status-jellyseerr_mirror",
  ),
  // Audiobookshelf
  new Server(
    "https://audiobook.snakycat.uk/",
    "https://snakycat-abs.duckdns.org/audiobookshelf/login",
    "status-abs",
    "status-abs_mirror",
  ),
  // Navidrome
  new Server("https://music.snakycat.uk/", null, "status-navidrome", null),
];

// -------------------
// Main Entrypoint
// -------------------

// Activates once the site loads
addEventListener("load", (_event) => {
  // Run the initial status check
  check_servers();
  // Enable the manual status check button
  document.getElementById("check-status-btn").onclick = check_servers;

  // Activate the automatic status check timer
  // setInterval takes milliseconds as its duration argument,
  // so its necessary to multiply by 1000
  setInterval(check_servers, STATUS_INTERVAL_SECONDS * 1000);
});

// --------------------
// Helper Functions
// --------------------

// Gets the status of the different urls of all the servers and updates their
// respective indicator elements
function check_servers() {
  // Reset status indicators
  for (let i = 0; i < SERVERS.length; i++) {
    let server = SERVERS[i];
    let main_indicator = document.getElementById(server.main_indicator_id);
    let mirror_indicator = document.getElementById(server.mirror_indicator_id);

    if (main_indicator != null) {
      main_indicator.style.backgroundColor = PENDING_STATUS_COLOR;
    }

    if (mirror_indicator != null) {
      mirror_indicator.style.backgroundColor = PENDING_STATUS_COLOR;
    }
  }

  // Send out web requests
  for (let i = 0; i < SERVERS.length; i++) {
    let server = SERVERS[i];
    let status = check_server_status(server);

    console.debug(status);

    // Update the status indicator when the response is received
    status.then(
      (status) => {
        update_server_status_indicators(server, status);
      },
      (err) => {
        console.error(err);
      },
    );
  }
}

// Gets the status of the different urls of the specified server
async function check_server_status(server) {
  let main_status = await check_url(server.main_url);
  let mirror_status = await check_url(server.mirror_url);

  return new ServerStatus(main_status, mirror_status);
}

// Updates the status indicators of a particular server if they exist
function update_server_status_indicators(server, status) {
  console.debug(
    "Updating server status indicators for " +
      server.main_url +
      " | " +
      server.mirror_url,
  );
  let main_indicator = document.getElementById(server.main_indicator_id);
  let mirror_indicator = document.getElementById(server.mirror_indicator_id);

  // Update main indicator
  if (main_indicator != null) {
    let status_color = status.main_status
      ? ONLINE_STATUS_COLOR
      : OFFLINE_STATUS_COLOR;

    main_indicator.style.backgroundColor = status_color;
  }

  // Update mirror indicator
  if (mirror_indicator != null) {
    let status_color = status.mirror_status
      ? ONLINE_STATUS_COLOR
      : OFFLINE_STATUS_COLOR;

    mirror_indicator.style.backgroundColor = status_color;
  }
}

// Checks the status of an (optional) url, returns false (offline) if the url isnt provided
async function check_url(url) {
  if (url == null || url == undefined) {
    // early return for nonexistant url
    return false;
  }

  // fetch from url
  return await request_status(url);
}

// Checks the server status of a url by sending a fetch request to the url
// if it responds with 2XX or 3XX then it returns true (online) otherwise false (offline)
async function request_status(url) {
  try {
    const response = await fetch(url, {
      mode: "no-cors",
    });
    return response.status < 400;
  } catch (err) {
    console.error(err);
    return false;
  }
}
