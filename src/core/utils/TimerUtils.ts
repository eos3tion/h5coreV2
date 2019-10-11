import { Callback } from "./Callback";
import { appendTo } from "./ArrayUtil";
import { recyclable, Recyclable } from "./ClassUtils";

export const enum TickCallbackState {
    /**
     * 未激活
     */
    Sleep,
    /**
     * 正在运行中
     */
    Running,
    /**
     * 需要在下次被移除
     */
    NeedRemove,
    /**
     * 激活了，但是暂停执行
     */
    Paused,
}

export type TickFunction = { (now?: number, ...args: any[]): any };


export interface TickerOption extends CallLaterOption {

    /**
     * 延迟执行的总次数，
     * 默认为永远执行
     */
    count?: number;

    /**
     * 是否立即执行  
     * 立即执行的调用，不影响`count`的次数  
     * 
     */
    runNow?: boolean;
}

interface GTimer {
    /**
     * 标识
     */
    tid: number;
    /**
     * 回调列表
     */
    list: TickCallback[];
    /**
     * 下一帧要执行的回调列表
     */
    next: TickCallback[];
    /**
     * 下次可执行的时间
     */
    nt: number;

}

class TickCallback extends Callback<TickFunction> {
    /**
     * 执行次数
     */
    count = Infinity;

    tid = NaN;

    guid = 0;
    /**
     * `ticker`的guid
     */
    ticker = 0;

    state = TickCallbackState.Sleep;

    doRecycle = false;
}

// 回调的 全局管理
let guid = 0;
const dict = {} as { [guid: number]: Recyclable<TickCallback> }

// ticker的全局管理
let tickerGuid = 1;
let tickers = {} as { [guid: number]: Ticker };

/**
 * 用于获取当前时间的方法
 */
export type getNowHandler = { (): number; }

/**
 * 获取时间处理的工具类型
 * @param getNow 获取当前时间的回调函数
 * @param minTimeframe 用于合并执行函数的最小时间片，处于同一时间片的函数会被一同执行
 */
export function getTicker(getNow: getNowHandler, minTimeframe = 10) {
    const _timeobj: { [index: number]: GTimer } = {};
    let tmpList: TickCallback[] = [];
    let willDeleted: number[] = [];
    const ticker = {
        guid: tickerGuid,
        tick,
        add,
        remove,
        pause,
        resume,
    }
    tickers[tickerGuid] = ticker;
    return ticker;
    function tick(now: number) {
        let d = 0;
        for (let key in _timeobj) {
            let timer = _timeobj[key];
            let { nt, list, next } = timer;
            if (next.length) {
                appendTo(next, list);
                next.length = 0;
            }
            if (nt < now) {
                timer.nt = now + timer.tid;
                let len = list.length;
                if (len > 0) {
                    let j = 0, k = 0;
                    for (let i = 0; i < len; i++) {
                        let cb = list[i];
                        let state = cb.state;
                        if (state != TickCallbackState.NeedRemove && cb.count > 0) {
                            list[j++] = cb;
                            if (state != TickCallbackState.Paused) {
                                tmpList[k++] = cb;
                            }
                        } else {
                            cb.state = TickCallbackState.Sleep;
                            cb.recycle();
                        }
                    }
                    list.length = j;
                    for (let i = 0; i < k; i++) {
                        let cb = tmpList[i];
                        cb.call(now);
                        cb.count--;
                    }
                }
                len = list.length;
                if (len == 0) {
                    willDeleted[d++] = +key;
                }
            }
        }
        for (let i = 0; i < d; i++) {
            delete _timeobj[willDeleted[i]];
        }
    }

    function getInterval(time: number) {
        return Math.ceil(time / minTimeframe) * minTimeframe;
    }


    /**
     * 注册回调 会对在同一个时间区间的 `callback`相同的情况下，才会去重
     * @param interval 时间间隔
     * @param opt 
     * @returns 回调标识
     */
    function add(interval: number, opt: TickFunction | TickerOption, ...args: any[]) {
        let context: any, callback: TickFunction, count: number, runNow: boolean, unique: boolean;
        if (typeof opt == "function") {
            callback = opt;
        } else {
            ({ context, callback, runNow, count, unique } = opt);
        }
        count = ~~count;
        if (count <= 0) {
            count = Infinity;
        }
        let now = getNow();
        if (runNow) {//如果只执行一次`true`则比为非循环执行
            callback.call(context, now, ...args);
        }

        interval = getInterval(interval);
        let timer = _timeobj[interval];
        if (!timer) {
            timer = { tid: interval, nt: getNow() + interval, list: [], next: [] };
            _timeobj[interval] = timer;
        }

        let cb: Recyclable<TickCallback>
        const next = timer.next;
        if (unique) {
            cb = Callback.checkList<TickFunction>(next, callback, context) as Recyclable<TickCallback>;
        }

        if (cb) {
            cb.args = args;
        } else {
            cb = recyclable(TickCallback);
            cb.init(callback, context, args);
            cb.tid = interval;
            next.push(cb);
            cb.guid = ++guid;
            dict[guid] = cb;
        }

        cb.count = count;
        cb.state = TickCallbackState.Running;
        return cb.guid;
    }

    /**
     * 移除回调  
     * 当前帧只将回调标记为可移除的状态，在下一帧执行前进行移除
     * @param guid
     */
    function remove(guid: number) {
        removeCB(guid, dict);
    }

    function pause(guid: number) {
        setState(guid, TickCallbackState.Paused);
    }

    function resume(guid: number) {
        setState(guid, TickCallbackState.Running);
    }

    function setState(guid: number, state: TickCallbackState) {
        let cb = dict[guid];
        if (cb) {
            let oldState = cb.state;
            if (oldState != state && (oldState == TickCallbackState.Running || oldState == TickCallbackState.Paused)) {
                cb.state = state;
            }
        }
    }
}

// /**
//  * 全局移除回调
//  * @param guid 
//  */
// export function removeTick(guid: number) {
//     let tick = dict[guid];
//     if (tick) {
//         let ticker = tickers[tick.ticker];
//         if (ticker) {
//             return ticker.remove(guid);
//         }
//     }
// }

export type Ticker = ReturnType<typeof getTicker>


export interface CallLaterOption {
    callback: TickFunction;
}

export interface CallLaterOption {
    /**
     * 回调函数
     */
    callback: TickFunction;


    /**
     * 上下文
     */
    context?: any;

    /**
     * 是否验证唯一  
     * 如果此值设置为 `true`，则加入前，会先检查函数列表中，是否有`回调函数`和`上下文相同`的
     */
    unique?: boolean;
}

class CallLaterCallback extends Callback<TickFunction> {
    nt = 0;

    guid = 0;

    state = TickCallbackState.Sleep;
}

let cGuid = 0;
let cDict = {} as { [guid: number]: CallLaterCallback };

// ticker的全局管理
let callLaterGuid = 1;
let callLaters = {} as { [guid: number]: CallLater };
export function getCallLater(getNow: getNowHandler) {
    let list: CallLaterCallback[] = [];
    let next: CallLaterCallback[] = [];
    let temp: CallLaterCallback[] = [];
    let callLater = {
        guid: callLaterGuid,
        add,
        tick,
        remove
    }
    callLaters[callLaterGuid++] = callLater;
    return callLater;
    function add(timeout: number, opt: TickFunction | CallLaterOption, ...args: any[]) {
        let context: any, callback: TickFunction, unique: boolean;
        if (typeof opt == "function") {
            callback = opt;
        } else {
            ({ context, callback } = opt);
        }

        let cb: Recyclable<CallLaterCallback>
        if (unique) {
            cb = Callback.checkList<TickFunction>(list, callback, context) as Recyclable<CallLaterCallback>;
        }

        if (cb) {
            cb.args = args;
        } else {
            cb = recyclable(CallLaterCallback);
            cb.init(callback, context, args);
            next.push(cb);
            cb.guid = ++cGuid;
            cDict[guid] = cb;
        }
        cb.nt = getNow() + timeout;
        cb.state = TickCallbackState.Running;
        return cb.guid;
    }
    function tick(now: number) {
        if (next.length) {
            appendTo(next, list);
            next.length = 0;
        }
        let i = 0, j = 0, k = 0;
        for (i = 0; i < list.length; i++) {
            const cb = list[i];
            const state = cb.state;
            if (state == TickCallbackState.Running) {
                if (now > cb.nt) {
                    temp[j++] = cb;
                } else {
                    list[k++] = cb;
                }
            } else if (state == TickCallbackState.NeedRemove) {
                cb.recycle();
            }
        }
        list.length = k;
        for (i = 0; i < j; i++) {
            temp[i].call(now);
        }
    }
    function remove(guid: number) {
        removeCB(guid, cDict);
    }
}

export type CallLater = ReturnType<typeof getCallLater>;


function removeCB(guid: number, dict: { [guid: number]: { state: TickCallbackState } }) {
    let cb = dict[guid];
    if (cb) {
        cb.state = TickCallbackState.NeedRemove;
        delete dict[guid];
        return true;
    }
}