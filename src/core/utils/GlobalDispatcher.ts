import { EventEmitter, EventType } from "./EventEmitter";

let dispatcher = new EventEmitter();

export function dispatch(event: EventType, data?: any) {
    dispatcher.dispatch(event, data);
}

export function on(type: EventType, listener: Function, context?: any) {
    dispatcher.on(type, listener, context);
}

export function off(type: EventType, listener: Function, context?: any) {
    dispatcher.off(type, listener, context);
}