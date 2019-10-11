import { EventEmitter, EventType } from "../core/utils/EventEmitter";
import { getProcessCtrl } from "../core/ProcessCtrl";
import { Noop } from "../core/constants/Empty";

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
/**
 * 游戏中的数据
 */
export module App {

    export let frameBuffer: WebGLFramebuffer;
    /**
     * 是否为手机
     */
    export let isMobile = false;

    /**
     * 特效级别
     * 0 关闭 除环境光以外的所有灯光 
     * 1 开启光
     */
    export let effect = GameEffect.Middle;

    /**
     * 纹理缩放
     */
    export let graphicsScale = .5;

    export let width: number;

    export let height: number;

    export let innerWidth: number;

    export let innerHeight: number;

    /**
     * 播放声音  
     */
    export let playSound: { (uri: string): void } = Noop;

    export let vibrate: { (): void } = Noop;

    let _now = 0;
    export function getNow() {
        return _now;
    }

    /**
     * 现在不由Core定义是走 `requestAnimateFrame` 还是走其他的 `ticker`  
     * 外部项目通过调用`tick`方法来完成循环
     * @param now 当前时间
     */
    export function tick(now: number) {
        _now = now;
        ctrl.tick(now);
    }

    let ctrl = getProcessCtrl(getNow);

    export const {
        addTick,
        removeTick,
        pauseTick,
        resumeTick,
        callLater,
        clearCallLater,
        nextTick,
        clearNextTick
    } = ctrl
}