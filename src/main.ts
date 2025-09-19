import { app, BrowserWindow, Tray } from "electron";
import { createTray, setOffline, setOnline, setReconnecting } from "./tray";
import { createInteractionWindow } from "./interaction-window";
import { createMainWindow } from "./main-window";
import { createEmitter } from "./events";
import { connect, reconnect } from "./socket";

const events = createEmitter();

let tray: Tray | undefined;
let mainWindow: BrowserWindow | undefined;
let isQuitting = false;

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
    connect({ events });
});

app.on("before-quit", () => {
    isQuitting = true;
});

app.on("window-all-closed", () => {
});

events.on("socket:open", () => {
    console.log("Connected to WebSocket server");
});

events.on("socket:message", (data) => {
    console.log("Message from server:", data);

    const separatorIndex = data.indexOf(":");
    const [type, value] =
        separatorIndex === -1
            ? [data, ""]
            : [data.slice(0, separatorIndex), data.slice(separatorIndex + 1)];

    if (type === "AgentStatus") {
        events.emit("agent:status", value);
        return;
    }

    if (type === "AgentReceivedMessage") {
        try {
            const payload = JSON.parse(value);
            const { type: messageType = "", content = "" } = payload;

            console.log("Received message", "type", messageType, "content", content);

            events.emit("agent:message", messageType, content);
        } catch (err) {
            console.error("Failed to parse data", err);
        } finally {
            return;
        }
    }
});

events.on("socket:error", (err) => {
    console.error("WebSocket error:", err);
    setOffline({ tray });
    reconnect({ events });
});

events.on("socket:close", () => {
    console.log("WebSocket connection closed");
    setOffline({ tray });
    reconnect({ events });
});

events.on("agent:status", (status) => {
    console.log("Received agent:status", status);
    if (status === "Online") {
        setOnline({ tray });
    } else if (status === "Offline" || status === "Stopped") {
        setOffline({ tray });
    } else if (status === "Reconnecting") {
        setReconnecting({ tray });
    }
});

events.on("agent:message", (type, content) => {
    if (type === "user_interaction_html") {
        createInteractionWindow(content);
        return;
    }

    if (type === "links") {
        mainWindow?.webContents?.send("agent:links", content);
        return;
    }
});
