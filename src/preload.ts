import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
    onUpdateLinks: (callback: (value: string) => void) =>
        ipcRenderer.on("agent:links", (_event, value) => callback(value)),
    clearUpdateLinks: () => {
        ipcRenderer.removeAllListeners("agent:links");
    }
});
