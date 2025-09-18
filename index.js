const { app, BrowserWindow, Tray, Menu } = require("electron");
const { nativeImage } = require("electron/common");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadFile("index.html");
};

const createInteractionWindow = (html) => {
  const win = new BrowserWindow({
    width: 400,
    height: 300,
    autoHideMenuBar: true,
  });

  win.loadURL(`data:text/html,${html}`);
};

// save a reference to the Tray object globally to avoid garbage collection
let tray;

const offlineIcon = nativeImage.createFromPath(__dirname + "/icon/offline.png");
const onlineIcon = nativeImage.createFromPath(__dirname + "/icon/online.png");

const reconnect = (delayMs = 2000) => {
  console.log(`Reconnecting in ${delayMs / 1000}s...`);
  setTimeout(runClient, delayMs);
};

const runClient = () => {
  const socket = new WebSocket("ws://localhost:50001/ws");

  socket.addEventListener("open", () => {
    app.emit("socket:open");
  });

  socket.addEventListener("message", (event) => {
    app.emit("socket:message", event.data);
  });

  socket.addEventListener("error", (err) => {
    app.emit("socket:error", err);
  });

  socket.addEventListener("close", () => {
    app.emit("socket:close");
  });
};

const setupTray = () => {
  tray = new Tray(offlineIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show",
      click: () => {
        createWindow();
      },
    },
    { role: "quit" },
  ]);
  tray.setContextMenu(contextMenu);
  tray.setTitle("Agent Smith");
  tray.setToolTip("Offline");
};

app.whenReady().then(() => {
  setupTray();
  runClient();
});

app.on("window-all-closed", () => {
  // having this listener active will prevent the app from quitting.
});

app.on("socket:open", () => {
  console.log("Connected to WebSocket server");
});

app.on("socket:message", (data) => {
  console.log("Message from server:", data);

  const separatorIndex = data.indexOf(":");
  const [type, value] =
    separatorIndex === -1
      ? [data, ""]
      : [data.substr(0, separatorIndex), data.substr(separatorIndex + 1)];

  if (type === "AgentStatus") {
    app.emit("agent:status", value);
    return;
  }

  if (type === "AgentReceivedMessage") {
    try {
      const payload = JSON.parse(value);
      const { type: messageType = "", content = "" } = payload;
      console.log("Received message", "type", messageType, "content", content);

      if (messageType === "user_interaction_html") {
        createInteractionWindow(content);
      }
    } catch (err) {
      console.error("Failed to parse data", err);
    }
    return;
  }
});

app.on("socket:error", (err) => {
  console.error("WebSocket error:", err);
  reconnect();
});

app.on("socket:close", () => {
  console.log("WebSocket connection closed");
  reconnect();
});

app.on("agent:status", (status) => {
  console.log("Received agent:status", status);
  if (status === "Online") {
    tray.setToolTip("Online");
    tray.setImage(onlineIcon);
  } else if (status === "Offline" || status === "Stopped") {
    tray.setToolTip("Offline");
    tray.setImage(offlineIcon);
  } else if (status === "Reconnecting") {
    tray.setToolTip("Reconnecting...");
    tray.setImage(offlineIcon);
  }
});
