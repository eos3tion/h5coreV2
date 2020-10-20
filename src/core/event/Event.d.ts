type EventType = string | number;

//@ts-ignore
interface DataEvent extends Event {
    type: EventType;
    data?: any;
    target?: any;

    /**
     * 事件是否已经停止，只在`DisplayObjectContainer`中有效
     */
    stop?: boolean;
}

interface EventDispatcher {
    off(event: Key, fn: Function, context?: any): any;
    on(event: Key, fn: Function, context?: any): any;
    dispatch(event: EventType, data?: any): any;
}