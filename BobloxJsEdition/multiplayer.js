// this is extracted code from CloudLink Delta https://github.com/cloudlink-delta
(function () {
    // 1. Establish the fallback layer instantly to protect the game loop
    class FallbackOfflineLink {
        constructor() {
            this.isOnline = false;
            console.log("[Engine Cloud] Initialized in Local Offline Mode.");
        }
        broadcast() { /* Drops outbound network ticks silently when offline */ }
        connectToPeer() { console.warn("Network unavailable. Cannot link players."); return null; }
    }

    // Assign baseline safety net variable immediately
    window.cldelta = new FallbackOfflineLink();

    // Integrated official v1.5.5 script link priority array
    const PEERJS_SOURCES = [
        'https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js',
        'https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js'
    ];

    // 2. Real networking controller executed only if a library path resolves completely
    class CloudLinkDeltaStandalone {
        constructor() {
            this.peer = null;
            this.name = '';
            this.dataConnections = new Map();
            this.newestConnected = '';
            this.lastDisconnected = '';
            this.peerStatus = 'idle';
            this.verboseLogs = false;

            // Extracted official cloud signaling architecture parameters
            this.sessionServer = {
                host: 'peerjs.mikedev101.cc',
                port: 443,
                secure: true,
                path: '/',
                key: 'peerjs',
                config: {
                    iceTransportPolicy: 'all',
                    iceServers: [
                        // Safe, globally whitelisted STUN servers that school filters never block
                        { urls: 'stun:google.com' },
                        { urls: 'stun:google.com' },
                        { urls: 'stun:google.com' },
                        { urls: 'stun:cloudflare.com' }
                    ]
                }
            };


            this.gmsg_state = new Map(); // Global Message state
            this.pmsg_state = new Map(); // Private Message state
        }

        connect(username) {
            if (!username || username.trim() === "") {
                console.error("[CLΔ Standalone] Username cannot be empty.");
                return;
            }
            this.peerStatus = 'connecting';
            this.name = username.trim();

            try {
                this.peer = new Peer(this.name, {
                    host: this.sessionServer.host,
                    port: this.sessionServer.port,
                    secure: this.sessionServer.secure,
                    path: this.sessionServer.path,
                    key: this.sessionServer.key,
                    config: this.sessionServer.config,
                    debug: this.verboseLogs ? 3 : 1
                });
                this.attachSignalHandlers();
            } catch (e) {
                this.peerStatus = 'error';
                console.error("[CLΔ Standalone] Instantiation step failed:", e);
            }
        }

        attachSignalHandlers() {
            this.peer.on('open', (id) => {
                this.peerStatus = 'open';
                this.isOnline = true;
                console.log(`%c[CLΔ Engine] Connected to matchmaker! Player Session ID: ${id}`);
                if (typeof window.onEngineNetworkOpen === 'function') window.onEngineNetworkOpen(id);
            });

            this.peer.on('connection', (conn) => {
                this.dataConnections.set(conn.peer, conn);
                this.bindConnectionChannels(conn);
            });

            this.peer.on('disconnected', () => {
                this.peerStatus = 'disconnected';
                this.isOnline = false;
                console.warn("[CLΔ Engine] Disconnected from signaling nodes.");
            });

            this.peer.on('error', (err) => {
                this.peerStatus = 'error';
                this.isOnline = false;
                if (err["type"] == "network") {
                    console.warn("[CLΔ Engine] Internet likley unavailable")
                } else {
                    console.error("[CLΔ Engine] Internal pipeline error:", err);
                }
            });
        }

        bindConnectionChannels(conn) {
            conn.on('open', () => {
                this.newestConnected = conn.peer;
                console.log(`[CLΔ Engine] Target peer linked successfully: ${conn.peer}`);

                // Perform official CLD Protocol initialization packet broadcast handshake
                conn.send(JSON.stringify({
                    opcode: 'NEGOTIATE',
                    ttl: 1,
                    payload: { version: { major: 1, minor: 0, patch: 0 }, spec_version: 0 }
                }));

                if (typeof window.onPeerLinked === 'function') window.onPeerLinked(conn.peer);
            });

            conn.on('data', (raw) => {
                try {
                    const packet = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    this.routeIncomingProtocol(conn.peer, packet);
                } catch (err) {
                    console.error("[CLΔ Engine] Error parsing network data packet:", err);
                }
            });

            conn.on('close', () => {
                this.lastDisconnected = conn.peer;
                this.dataConnections.delete(conn.peer);
                console.log(`[CLΔ Engine] Peer dropped connection: ${conn.peer}`);
                if (typeof window.onPeerDropped === 'function') window.onPeerDropped(conn.peer);
            });
        }

        routeIncomingProtocol(sender, packet) {
            const { opcode, payload } = packet;

            switch (opcode) {
                case 'G_MSG': // Global Network Packet Broadcast updates
                    this.gmsg_state.set('default', payload);
                    if (typeof window.routeIncomingGameData === 'function') {
                        window.routeIncomingGameData({ type: 'BROADCAST', from: sender, data: payload });
                    }
                    break;

                case 'P_MSG': // Private Peer targeted messaging frames
                    if (!this.pmsg_state.has(sender)) this.pmsg_state.set(sender, new Map());
                    this.pmsg_state.get(sender).set('default', payload);
                    if (typeof window.routeIncomingGameData === 'function') {
                        window.routeIncomingGameData({ type: 'PRIVATE', from: sender, data: payload });
                    }
                    break;

                default:
                    break;
            }
        }

        connectToPeer(targetId) {
            if (!this.peer || this.peer.destroyed) return null;

            // Simplifies connection execution loops to protect Chromebook sandboxes
            const conn = this.peer.connect(targetId);

            this.dataConnections.set(targetId, conn);
            this.bindConnectionChannels(conn);
            return conn;
        }


        broadcast(message) {
            const packet = { opcode: 'G_MSG', origin: this.name, ttl: 1, target: '*', payload: message };
            for (const [peerId, conn] of this.dataConnections) {
                if (conn.open) conn.send(JSON.stringify(packet));
            }
        }

        sendPrivate(targetId, message) {
            const packet = { opcode: 'P_MSG', origin: this.name, ttl: 1, target: targetId, payload: message };
            const conn = this.dataConnections.get(targetId);
            if (conn && conn.open) conn.send(JSON.stringify(packet));
        }
    }

    // 3. Dynamic Sequential Loader Loop matching the original fallback array scheme
    async function loadPeerInfrastructure(index = 0) {
        if (index >= PEERJS_SOURCES.length) {
            console.warn("[CLΔ Core Loader] All CDN routes exhausted. Staying in offline sandbox mode.");
            return;
        }

        const scriptUrl = PEERJS_SOURCES[index];
        const scriptEl = document.createElement('script');

        // NEW CRITICAL LINE: This tells the browser to unmute the errors for this file!
        scriptEl.crossOrigin = "anonymous";
        scriptEl.src = scriptUrl;

        scriptEl.onload = function () {
            window.cldelta = new CloudLinkDeltaStandalone();
            console.log(`[CLΔ Core Loader] Infrastructure bound successfully via index ${index}`);
        };

        scriptEl.onerror = function () {
            console.warn(`[CLΔ Core Loader] Route failed to resolve: ${scriptUrl}. Switching targets...`);
            loadPeerInfrastructure(index + 1);
        };

        document.head.appendChild(scriptEl);
    }


    // Initiate the sequential load process automatically on boot up
    loadPeerInfrastructure(0);
})();

// A safe helper function to generate a cryptographic UUID string v4 natively
function generateEngineUUID() {
    try {
        // Native modern browser method (fastest and most secure)
        return window.crypto.randomUUID();
    } catch (e) {
        // Safe math fallback string generator just in case crypto flags fail on older devices
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// Generate and store a unique identifier for the session
const MY_UNIQUE_PLAYER_ID = "BOBLOX_" + generateEngineUUID().substring(0, 8); // Uses first 8 characters for readable logs

function startMultiplayerNetwork() {
    if (typeof window.cldelta.connect === 'function') {
        console.log(`[Engine Cloud] Infrastructure ready. Registering session as: ${MY_UNIQUE_PLAYER_ID}`);

        // Pass the new UUID token into the matchmaker node
        window.cldelta.connect(MY_UNIQUE_PLAYER_ID);
    } else {
        setTimeout(startMultiplayerNetwork, 100);
    }
}

// Run the initialization sequence loop
startMultiplayerNetwork();


window.onEngineNetworkOpen = function (myFinalId) {
    console.log("[NETWORK] Connected as " + myFinalId);
};

window.onPeerLinked = function (remotePlayerId) {
    console.log("[NETWORK] Connected to player: " + remotePlayerId);
};

window.onPeerDropped = function (remotePlayerId) {
    console.log("[NETWORK] Player left the game: " + remotePlayerId);

    if (remotePlayers && remotePlayers[remotePlayerId]) {
        delete remotePlayers[remotePlayerId]; //removes players when disconnecting
    }
};

// Override the network gateway listener to process the required payload variables
window.routeIncomingGameData = function (payload) {
    const remoteSender = payload.from;
    const packet = payload.data;

    // Check the data type 
    if (packet.type === "LIVEDATA") { //player updates

        // If the player hasn't been added yet
        if (!remotePlayers[remoteSender]) {
            remotePlayers[remoteSender] = { x: 0, y: 0, sx: 0, state: 0, lastUpdate: Date.now() };
            console.log(`%c[BOBLOX Engine] Initialized character view loop instance for: ${remoteSender}`);
        }

        // Store all critical variables directly into a table
        remotePlayers[remoteSender].x = packet.x;                   // Character X Coordinate
        remotePlayers[remoteSender].y = packet.y;                   // Character Y Coordinate
        remotePlayers[remoteSender].sx = packet.sx;                 // Their X scroll
        remotePlayers[remoteSender].state = packet.state;           // Their current animation data (sending it fully allow custom modded animations that work with base clients)
        remotePlayers[remoteSender].g = packet.g;                   // The game they're currently in
        remotePlayers[remoteSender].s = packet.s;                   // Avatar scale in decimal
        remotePlayers[remoteSender].m = packet.m;                   // Should we mirror the player model when rendering 
        remotePlayers[remoteSender].n = packet.n;                   // Preffered name for stuff like the chat
        remotePlayers[remoteSender].ping = Date.now() - packet.time // ping
        remotePlayers[remoteSender].lastUpdate = Date.now();        // Heartbeat time for auto unloading

    } else if (packet.type === "CHAT" && packet.g == Currentgame) { //check if its a chat packet
        DrawMessage(String(JSON.parse(packet.n)) + ": " + String(packet.text)) //print the chat message if its a chat packet
    }

};

/*  
####################################
#SUPABASE API FOR AVAILABLE SERVERS#
####################################
*/

// supabase API URL
const SUPABASE_URL = "https://wzcrhodevcelyjxsmdcp.supabase.co";
// supabase key, this is not unsafe because its a public anon key
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6Y3Job2RldmNlbHlqeHNtZGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MzQ5MjIsImV4cCI6MjEwMzMxMDkyMn0.7wGVjetb2PRM-JcU7lUwn0S3hPT3UlBqc4o2gQweV3k";

const DB_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json"
};

let heartbeatIntervalTimer = null;
// 1. ROUTINE: Notify the supabase servers that the client is hosting a server
async function registerServerInCloud(roomCode, serverName) {
    try {
        const payload = {
            room_code: roomCode,
            server_name: serverName,
            player_count: 1
        };

        // check if the room already exists in the database
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/active_servers?room_code=eq.${roomCode}`, {
            method: "GET",
            headers: DB_HEADERS
        });
        const existingRooms = await checkResponse.json();

        let response;
        if (existingRooms.length > 0) {
            // If it exists, update it (this triggers a fresh heartbeat timestamp)
            response = await fetch(`${SUPABASE_URL}/rest/v1/active_servers?room_code=eq.${roomCode}`, {
                method: "PATCH",
                headers: DB_HEADERS,
                body: JSON.stringify({ server_name: serverName, player_count: 1 })
            });
        } else {
            // If it doesn't exist, create it
            response = await fetch(`${SUPABASE_URL}/rest/v1/active_servers`, {
                method: "POST",
                headers: DB_HEADERS,
                body: JSON.stringify(payload)
            });
        }

        if (response.ok) {
            console.log("Server published to cloud registry.");

            // start the heartbeat loop to prevent the server from being removed
            if (!heartbeatIntervalTimer) {
                heartbeatIntervalTimer = setInterval(function () {
                    if (window.cldelta.isOnline && isLobbyHost) {
                        console.log("Sending heartbeat ping to cloud database...");
                        // Re-running this function sends a PATCH request, updating the timestamp row
                        registerServerInCloud(roomCode, serverName);
                    } else {
                        // If we are no longer hosting, destroy the loop timer
                        clearInterval(heartbeatIntervalTimer);
                        heartbeatIntervalTimer = null;
                    }
                }, 30000); // 30000 milliseconds = 30 seconds
            }
        }
    } catch (e) {
        console.log("Database communication failed: " + e.message);
    }
}


// 2. ROUTINE: Grab the active directory table to draw the server browser list
async function fetchActiveCloudServers() {
    try {
        // Fetch rows updated in the last 60 seconds to eliminate dead game ghosts
        const cutoffTime = new Date(Date.now() - 60000).toISOString();
        const url = `${SUPABASE_URL}/rest/v1/active_servers?last_heartbeat=gt.${cutoffTime}&select=*`;

        const response = await fetch(url, { method: "GET", headers: DB_HEADERS });
        const servers = await response.json();

        console.log(`Fetched ${servers.length} live matching lobbies from database.`);
        return servers; // Returns an array of live room objects
    } catch (e) {
        console.log("Database download failed: " + e.message);
        return [];
    }
}

// 3. ROUTINE: Remove your server from the cloud when you close the room
async function deleteServerFromCloud(roomCode) {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/active_servers?room_code=eq.${roomCode}`, {
            method: "DELETE",
            headers: DB_HEADERS
        });
        console.log("Lobby closed and cleared from public matrix registries.");
    } catch (e) { }
}

// Automatically fires when a player closes their browser tab, navigates away or refreshes
window.onbeforeunload = function () {
    if (isLobbyHost && window.cldelta.name) {
        // Send a synchronous beacon or rapid request to wipe the server row before closing down
        fetch(`${SUPABASE_URL}/rest/v1/active_servers?room_code=eq.${window.cldelta.name}`, {
            method: "DELETE",
            headers: DB_HEADERS,
            keepalive: true // Crucial line to ensure the request finishes after the tab dies
        });
    }
};