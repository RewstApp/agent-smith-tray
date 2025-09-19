import { EventEmitter } from "events";
import { EventMap } from "./events";

type ConnectProps = {
    events: EventEmitter<EventMap>;
    port?: number;
    path?: string;
}

export const connect = (props: ConnectProps) => {
    const { events, port = 50001, path = "ws" } = props;
    const socket = new WebSocket(`ws://localhost:${port}/${path}`);

    socket.addEventListener("open", () => {
        events.emit("socket:open");
    });

    socket.addEventListener("message", (event) => {
        events.emit("socket:message", event.data);
    });

    socket.addEventListener("error", (err) => {
        events.emit("socket:error", err);
    });

    socket.addEventListener("close", () => {
        events.emit("socket:close");
    });

    return socket;
};

export const reconnect = (delayMs = 2000) => {
    console.log(`Reconnecting in ${delayMs / 1000}s...`);
    setTimeout(connect, delayMs);
};
