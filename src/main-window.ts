import { BrowserWindow, Event } from "electron";
import { onlineIcon } from "./tray";
import path from "path";

type CreateMainWindowProps = {
    onClose?: (event: Event) => void;
}

export const createMainWindow = (props: CreateMainWindowProps | undefined) => {
    const { onClose } = props ?? {};

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "../dist/preload.js"),
        },
        icon: onlineIcon,
    });

    if (onClose) {
        mainWindow.on("close", onClose);
    }

    mainWindow.loadFile("index.html");

    return mainWindow;
};