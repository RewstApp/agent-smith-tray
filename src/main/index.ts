import { app, BrowserWindow, ipcMain, session, Tray } from 'electron';
import { createTray, onlineIcon, setOffline, setOnline, setReconnecting } from './tray';
import { createEmitter } from './events';
import { connect, reconnect } from './socket';
import { createInteractionWindow } from '../interaction-window';
import * as path from "path";
import { getConfigFilePath, loadLinks, storeLinks } from './config';
import { Link } from '../models';

const events = createEmitter();

let tray: Tray | undefined;
let mainWindow: BrowserWindow | undefined;
let isQuitting = false;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    icon: onlineIcon,
  });

  mainWindow.on("close", (event) => {
    if (isQuitting) {
      return;
    }

    event.preventDefault();
    mainWindow?.hide();
  });

  mainWindow.loadURL(path.join(__dirname, "index.html"));
};

app.on('ready', () => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (details.webContentsId === mainWindow?.webContents?.id) {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self' https: data:; " +
            "script-src 'self' 'unsafe-eval'; " +
            "style-src 'self' https: 'unsafe-inline'; "
          ]
        }
      });
      return;
    }

    if (details.responseHeaders) {
      callback(details.responseHeaders);
    }
  });

  createWindow();
  tray = createTray({ mainWindow });
  connect({ events });
});

app.on("before-quit", () => {
  isQuitting = true;
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
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
    }

    return;
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

events.on("agent:message", async (type, content) => {
  if (type === "user_interaction_html") {
    createInteractionWindow(content);
    return;
  }

  if (type === "links") {
    mainWindow?.webContents?.send("agent:links", content);
    await storeLinks(JSON.parse(content) as Link[]);

    console.log("Links stored in " + getConfigFilePath());
    return;
  }
});

ipcMain.handle("load:links", async () => {
  const links = await loadLinks();
  console.log("Links loaded from " + getConfigFilePath());

  return links;
});