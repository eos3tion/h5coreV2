import { getNowHandler, getCallLater, getTicker, TickFunction, TickerOption } from "./utils/TimerUtils";

/**
 * 用于流程控制  
 * 内置`CallLater` `Ticker`和`nextTick`
 * 执行顺序，
 * 1. `nextTick`  
 * 2. `CallLater`  
 * 3. `Ticker`  
 * 
 */
export function getProcessCtrl(getNow: getNowHandler, minTimeFrame = 10) {
    let callLater = getCallLater(getNow);
    let ticker = getTicker(getNow, minTimeFrame);
    let nextTick = getCallLater(getNow);
    return {
        tick(now: number) {
            nextTick.tick(now);
            callLater.tick(now);
            ticker.tick(now);
        },
        nextTick(opt: TickFunction | TickerOption, ...args: any[]) {
            return nextTick.add(0, opt, ...args);
        },
        clearNextTick(guid: number) {
            nextTick.remove(guid);
        },
        callLater(timeout: number, opt: TickFunction | TickerOption, ...args: any[]) {
            return callLater.add(timeout, opt, ...args);
        },
        clearCallLater(guid: number) {
            callLater.remove(guid);
        },
        addTick(interval: number, opt: TickFunction | TickerOption, ...args: any[]) {
            return ticker.add(interval, opt, ...args);
        },
        removeTick(guid: number) {
            ticker.remove(guid);
        },
        resumeTick(guid: number) {
            ticker.resume(guid);
        },
        pauseTick(guid: number) {
            ticker.pause(guid);
        }
    }
}

/**
 * 流程控制
 */
export type ProcessCtrl = ReturnType<typeof getProcessCtrl>;