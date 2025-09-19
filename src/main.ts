import { app, BrowserWindow, Tray } from "electron";
import { EventEmitter } from "events";
import { createTray, setOffline, setOnline, setReconnecting } from "./tray";
import { createInteractionWindow } from "./interaction-window";
import { createMainWindow } from "./main-window";

let tray: Tray | undefined;
let mainWindow: BrowserWindow | undefined;
let isQuitting = false;

const customEvents = new EventEmitter();

const reconnect = (delayMs = 2000) => {
    console.log(`Reconnecting in ${delayMs / 1000}s...`);
    setTimeout(runClient, delayMs);
};

const runClient = () => {
    const socket = new WebSocket("ws://localhost:50001/ws");

    socket.addEventListener("open", () => {
        customEvents.emit("socket:open");
    });

    socket.addEventListener("message", (event) => {
        customEvents.emit("socket:message", event.data);
    });

    socket.addEventListener("error", (err) => {
        customEvents.emit("socket:error", err);
    });

    socket.addEventListener("close", () => {
        customEvents.emit("socket:close");
    });
};

app.whenReady().then(() => {
    mainWindow = createMainWindow({
        onClose: (event) => {
            if (isQuitting) {
                return;
            }

            event.preventDefault();
            mainWindow?.hide();
        }
    });
    tray = createTray({ mainWindow });
    runClient();
});

app.on("before-quit", () => {
    isQuitting = true; // set flag before quitting
});

app.on("window-all-closed", () => {
    // having this listener active will prevent the app from quitting.
});

customEvents.on("socket:open", () => {
    console.log("Connected to WebSocket server");
});

customEvents.on("socket:message", (data) => {
    console.log("Message from server:", data);

    const separatorIndex = data.indexOf(":");
    const [type, value] =
        separatorIndex === -1
            ? [data, ""]
            : [data.substr(0, separatorIndex), data.substr(separatorIndex + 1)];

    if (type === "AgentStatus") {
        customEvents.emit("agent:status", value);
        return;
    }

    if (type === "AgentReceivedMessage") {
        try {
            const payload = JSON.parse(value);
            const { type: messageType = "", content = "" } = payload;

            console.log("Received message", "type", messageType, "content", content);

            customEvents.emit("agent:message", messageType, content);
        } catch (err) {
            console.error("Failed to parse data", err);
        } finally {
            return;
        }
    }
});

customEvents.on("socket:error", (err) => {
    console.error("WebSocket error:", err);
    setOffline({ tray });
    reconnect();
});

customEvents.on("socket:close", () => {
    console.log("WebSocket connection closed");
    setOffline({ tray });
    reconnect();
});

customEvents.on("agent:status", (status) => {
    console.log("Received agent:status", status);
    if (status === "Online") {
        setOnline({ tray });
    } else if (status === "Offline" || status === "Stopped") {
        setOffline({ tray });
    } else if (status === "Reconnecting") {
        setReconnecting({ tray });
    }
});

customEvents.on("agent:message", (type, content) => {
    if (type === "user_interaction_html") {
        createInteractionWindow(content);
        return;
    }

    if (type === "links") {
        mainWindow?.webContents?.send("agent:links", content);
        return;
    }
});
