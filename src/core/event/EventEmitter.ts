export function getDataEvent(type: EventType, data?: any, target?: any) {
    return { type, data, target, stop: false } as DataEvent;
}



let has = Object.prototype.hasOwnProperty
    , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
class Events {
    [evt: string]: EE | EE[]
}



/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
class EE {
    fn: Function;
    context: any;
    once: boolean;
    constructor(fn: Function, context: any, once?: boolean) {
        this.fn = fn;
        this.context = context;
        this.once = !!once;
    }
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter: EventEmitter, event: Key, fn: Function, context: any, once?: boolean) {
    if (typeof fn !== 'function') {
        throw new TypeError('The listener must be a function');
    }

    let listener = new EE(fn, context || emitter, once)
        , evt = prefix ? prefix + event : event;

    let _events = emitter._events;
    let evts = _events[evt];

    if (!evts) {
        _events[evt] = listener, emitter._eventsCount++;
    }
    else if (Array.isArray(evts)) {
        evts.push(listener);
    }
    else {
        _events[evt] = [emitter._events[evt], listener] as EE[];
    }

    return emitter;
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter: EventEmitter, evt: Key) {
    if (--emitter._eventsCount === 0) emitter._events = new Events();
    else delete emitter._events[evt];
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
export class EventEmitter {
    _events: Events;
    _eventsCount: number;
    constructor() {
        this._events = new Events();
        this._eventsCount = 0;
    }

    /**
     * Return an array listing the events for which the emitter has registered
     * listeners.
     *
     * @returns {Array}
     * @public
     */
    eventNames() {
        let names = [] as Key[]
            , events: Events

        if (this._eventsCount === 0) return names;

        for (let name in (events = this._events)) {
            if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
        }

        // if (Object.getOwnPropertySymbols) {
        //     return names.concat(Object.getOwnPropertySymbols(events));
        // }

        return names;
    }

    /**
     * Return the listeners registered for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @returns {Array} The registered listeners.
     * @public
     */
    listeners(event: Key) {
        let evt = prefix ? prefix + event : event
            , handlers = this._events[evt];

        if (!handlers) return [];
        if (!Array.isArray(handlers)) return [handlers.fn];

        for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
            ee[i] = handlers[i].fn;
        }

        return ee;
    };

    /**
     * Return the number of listeners listening to a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @returns {Number} The number of listeners.
     * @public
     */
    listenerCount(event: Key) {
        let evt = prefix ? prefix + event : event;
        let listeners = this._events[evt];

        if (!listeners) {
            return 0;
        }
        if (!Array.isArray(listeners)) {
            return 1;
        }
        return listeners.length;
    };

    /**
     * Calls each of the listeners registered for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @returns {Boolean} `true` if the event had listeners, else `false`.
     * @public
     */
    emit(event: Key, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any) {
        var evt = prefix ? prefix + event : event;

        if (!this._events[evt]) return false;

        var listeners = this._events[evt]
            , len = arguments.length
            , args
            , i;

        if (!Array.isArray(listeners)) {
            let { fn, once, context } = listeners;
            if (once) this.removeListener(event, fn, undefined, true);
            switch (len) {
                case 1: return fn.call(context), true;
                case 2: return fn.call(context, a1), true;
                case 3: return fn.call(context, a1, a2), true;
                case 4: return fn.call(context, a1, a2, a3), true;
                case 5: return fn.call(context, a1, a2, a3, a4), true;
                case 6: return fn.call(context, a1, a2, a3, a4, a5), true;
            }

            for (i = 1, args = new Array(len - 1); i < len; i++) {
                args[i - 1] = arguments[i];
            }

            fn.apply(listeners.context, args);
        } else {
            let length = listeners.length
                , j;

            for (i = 0; i < length; i++) {
                let { fn, once, context } = listeners[i];
                if (once) this.removeListener(event, fn, undefined, true);

                switch (len) {
                    case 1: fn.call(context); break;
                    case 2: fn.call(context, a1); break;
                    case 3: fn.call(context, a1, a2); break;
                    case 4: fn.call(context, a1, a2, a3); break;
                    default:
                        if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                            args[j - 1] = arguments[j];
                        }

                        fn.apply(context, args);
                }
            }
        }

        return true;
    };

    /**
     * Add a listener for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @param {*} [context=this] The context to invoke the listener with.
     * @returns {EventEmitter} `this`.
     * @public
     */
    on(event: Key, fn: Function, context: any = this) {
        return addListener(this, event, fn, context, false);
    };

    /**
     * Add a one-time listener for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @param {*} [context=this] The context to invoke the listener with.
     * @returns {EventEmitter} `this`.
     * @public
     */
    once(event: Key, fn: Function, context: any = this) {
        return addListener(this, event, fn, context, true);
    };

    /**
     * Remove the listeners of a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn Only remove the listeners that match this function.
     * @param {*} context Only remove the listeners that have this context.
     * @param {Boolean} once Only remove one-time listeners.
     * @returns {EventEmitter} `this`.
     * @public
     */
    removeListener(event: Key, fn: Function, context: any, once?: boolean) {
        let evt = prefix ? prefix + event : event;

        if (!this._events[evt]) return this;
        if (!fn) {
            clearEvent(this, evt);
            return this;
        }

        let listeners = this._events[evt];

        if (!Array.isArray(listeners)) {
            if (
                listeners.fn === fn &&
                (!once || listeners.once) &&
                (!context || listeners.context === context)
            ) {
                clearEvent(this, evt);
            }
        } else {
            for (var i = 0, events = [], length = listeners.length; i < length; i++) {
                if (
                    listeners[i].fn !== fn ||
                    (once && !listeners[i].once) ||
                    (context && listeners[i].context !== context)
                ) {
                    events.push(listeners[i]);
                }
            }

            //
            // Reset the array, or remove it completely if we have no more listeners.
            //
            if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
            else clearEvent(this, evt);
        }

        return this;
    };

    /**
     * Remove all listeners, or those of the specified event.
     *
     * @param {(String|Symbol)} [event] The event name.
     * @returns {EventEmitter} `this`.
     * @public
     */
    removeAllListeners(event: Key) {

        if (event) {
            let evt = prefix ? prefix + event : event;
            if (this._events[evt]) clearEvent(this, evt);
        } else {
            this._events = new Events();
            this._eventsCount = 0;
        }

        return this;
    };

    dispatch(event: Key, data?: any) {
        this.emit(event, getDataEvent(event, data, this));
    }

    static prefixed: string;

    static EventEmitter: typeof EventEmitter;
}

export interface EventEmitter {

    off(event: Key, fn: Function, context: any, once?: boolean): void;

    addListener(event: Key, fn: Function, context?: any): this;


}

const ept = EventEmitter.prototype;


//
// Alias methods names because people roll like that.
//
ept.off = ept.removeListener;
ept.addListener = ept.on;

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

