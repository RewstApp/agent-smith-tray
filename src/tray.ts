import { Tray, Menu, BrowserWindow } from "electron";
import { nativeImage } from "electron";
import path from "path";

export const offlineIcon = nativeImage.createFromPath(path.join(__dirname, "../icon/offline.ico"));
export const onlineIcon = nativeImage.createFromPath(path.join(__dirname, "../icon/online.ico"));

type CreateTrayProps = {
    mainWindow?: BrowserWindow;
};

type SetTrayProps = {
    tray?: Tray;
}

export const createTray = (props: CreateTrayProps | undefined) => {
    const { mainWindow } = props ?? {};
    const tray = new Tray(offlineIcon);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Show",
            click: () => {
                mainWindow?.show();
            },
        },
        {
            label: "Quit",
            role: "quit",
        },
    ]);
    tray.setContextMenu(contextMenu);
    tray.setTitle("Agent Smith");
    tray.setToolTip("Offline");

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
