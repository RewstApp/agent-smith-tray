import { contextBridge, ipcRenderer } from "electron/renderer";

contextBridge.exposeInMainWorld("electronAPI", {
  onUpdateLinks: (callback: (value: string) => void) =>
    ipcRenderer.on("agent:links", (_event, value) => callback(value)),
});
