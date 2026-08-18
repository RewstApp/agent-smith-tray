import { EventEmitter } from "events";
import WebSocket from "ws";
import { EventMap } from "./events";

type ConnectProps = {
    events: EventEmitter<EventMap>;
    port: number;
    token: string;
    path?: string;
}

type ReconnectProps = {
    delayMs?: number;
}

export const connect = (props: ConnectProps) => {
    const { events, port, token, path = "ws" } = props;
    const socket = new WebSocket(`ws://localhost:${port}/${path}`, {
        headers: {
            "X-Agent-Smith-Token": token,
        },
    });

    // socket.terminate() on a handshake that never completed makes ws emit
    // "error" and "close" right after "unexpected-response", so this guards
    // against reporting the same rejection to the caller more than once.
    let handshakeRejected = false;

    socket.on("open", () => {
        events.emit("socket:open");
    });

    socket.on("message", (data) => {
        events.emit("socket:message", data.toString());
    });

    // Fired when the server responds to the upgrade request with a non-101
    // status (e.g. 401 for a missing/invalid token) before a WebSocket
    // connection is ever established.
    socket.on("unexpected-response", (_req, res) => {
        handshakeRejected = true;

        if (res.statusCode === 401) {
            events.emit("socket:unauthorized");
        } else {
            events.emit("socket:error", new Error(`Unexpected response: ${res.statusCode}`));
        }
        socket.terminate();
    });

    socket.on("error", (err) => {
        if (handshakeRejected) {
            return;
        }
        events.emit("socket:error", err);
    });

    socket.on("close", () => {
        if (handshakeRejected) {
            return;
        }
        events.emit("socket:close");
    });
};

export const reconnect = (props: ReconnectProps, onReconnect: () => void) => {
    const { delayMs = 2000 } = props;
    console.log(`Reconnecting in ${delayMs / 1000}s...`);
    setTimeout(onReconnect, delayMs);
};
