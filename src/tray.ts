import { Tray, Menu, BrowserWindow, nativeImage } from "electron";
import path from "path";
import offlineIconName from "./assets/offline.ico";
import onlineIconName from "./assets/online.ico";

const offlineIconPath = path.join(__dirname, offlineIconName);
const onlineIconPath = path.join(__dirname, onlineIconName);

export const offlineIcon = nativeImage.createFromPath(offlineIconPath);
export const onlineIcon = nativeImage.createFromPath(onlineIconPath);

type CreateTrayProps = {
    mainWindow?: BrowserWindow;
};

type SetTrayProps = {
    tray?: Tray;
}

export const createTray = (props: CreateTrayProps | undefined) => {
    const { mainWindow } = props ?? {};
    const tray = new Tray(offlineIcon);
    const handleShow = () => {
        mainWindow?.show();
    };

    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Show",
            click: handleShow,
        },
        {
            label: "Quit",
            role: "quit",
        },
    ]);

    tray.setContextMenu(contextMenu);
    tray.setTitle("Agent Smith");
    tray.setToolTip("Offline");
    tray.on("double-click", handleShow);

    return tray;
};

export const setOnline = ({ tray }: SetTrayProps) => {
    tray?.setToolTip("Online");
    tray?.setImage(onlineIcon);
}

export const setOffline = ({ tray }: SetTrayProps) => {
    tray?.setToolTip("Offline");
    tray?.setImage(offlineIcon);
}

export const setReconnecting = ({ tray }: SetTrayProps) => {
    tray?.setToolTip("Reconnecting...");
    tray?.setImage(offlineIcon);
}
