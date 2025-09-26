import { contextBridge, ipcRenderer } from "electron";
import { Link } from "../models";

contextBridge.exposeInMainWorld("electronAPI", {
    onUpdateLinks: (callback: (value: string) => void) =>
        ipcRenderer.on("agent:links", (_event, value) => callback(value)),
    clearUpdateLinks: () => {
        ipcRenderer.removeAllListeners("agent:links");
    },
    loadLinks: async (): Promise<Link[]> => {
        return await ipcRenderer.invoke("load:links");
    }
});
