const { app, BrowserWindow, Tray, Menu } = require("electron");
const { nativeImage } = require("electron/common");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadFile("index.html");
};

// save a reference to the Tray object globally to avoid garbage collection
let tray;

const offlineIcon = nativeImage.createFromPath(__dirname + "/icon/offline.png");
const onlineIcon = nativeImage.createFromPath(__dirname + "/icon/online.png");

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
      } else {
        tray.setToolTip("Offline");
        tray.setImage(offlineIcon);
      }
      return;
    }
  });

  // Handle errors
  socket.addEventListener("error", (err) => {
    console.error("WebSocket error:", err);
  });

  // Handle close
  socket.addEventListener("close", () => {
    console.log("WebSocket connection closed");
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
