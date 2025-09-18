const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
  onUpdateLinks: (callback) =>
    ipcRenderer.on("agent:links", (_event, value) => callback(value)),
});
