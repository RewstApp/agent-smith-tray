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

app.whenReady().then(() => {
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
});

app.on("window-all-closed", () => {
  // having this listener active will prevent the app from quitting.
});
