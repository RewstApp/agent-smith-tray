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

const reconnect = (delay = 2000) => {
  console.log(`Reconnecting in ${delay / 1000}s...`);
  setTimeout(runClient, 2000);
};

const runClient = () => {
  const socket = new WebSocket("ws://localhost:50001/ws");

  // Connection opened
  socket.addEventListener("open", () => {
    console.log("Connected to WebSocket server");
  });

  // Listen for messages
  socket.addEventListener("message", (event) => {
    console.log("Message from server:", event.data);

    const separatorIndex = event.data.indexOf(":");
    const [type, value] =
      separatorIndex === -1
        ? [event.data, ""]
        : [
            event.data.substr(0, separatorIndex),
            event.data.substr(separatorIndex + 1),
          ];

    if (type === "AgentStatus") {
      if (value === "Online") {
        tray.setToolTip("Online");
        tray.setImage(onlineIcon);
      } else if (value === "Offline" || value === "Reconnecting") {
        tray.setToolTip("Offline");
        tray.setImage(offlineIcon);
      } else if (value === "Reconnecting") {
        tray.setToolTip("Reconnecting...");
        tray.setImage(offlineIcon);
      }
      return;
    }

    if (type === "AgentReceivedMessage") {
      try {
        const payload = JSON.parse(value);
        const { type: messageType = "", content = "" } = payload;
        console.log(
          "Received message",
          "type",
          messageType,
          "content",
          content
        );

        if (messageType === "user_interaction_html") {
          createInteractionWindow(content);
        }
      } catch (err) {
        console.error("Failed to parse data", err);
      }
      return;
    }
  });

  // Handle errors
  socket.addEventListener("error", (err) => {
    console.error("WebSocket error:", err);

    reconnect();
  });

  // Handle close
  socket.addEventListener("close", () => {
    console.log("WebSocket connection closed");

    reconnect();
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
