import { BrowserWindow } from "electron";
import { onlineIcon } from "./main/tray";

export const createInteractionWindow = (html: string) => {
    const win = new BrowserWindow({
        width: 600,
        height: 450,
        autoHideMenuBar: true,
        alwaysOnTop: true,
        icon: onlineIcon,
        title: "Agent Smith Tray",
    });

    win.loadURL(`data:text/html,${html}`);
};
