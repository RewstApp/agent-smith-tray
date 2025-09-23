import { EventEmitter } from "events";

export type EventMap = {
    "socket:open": [];
    "socket:message": [data: string];
    "socket:error": [err: Event];
    "socket:close": [];
    "agent:status": [status: string];
    "agent:message": [type: string, content: string];
}

export const createEmitter = () => {
    return new EventEmitter<EventMap>();
};
