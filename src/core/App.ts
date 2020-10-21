import { EventEmitter } from "./event/EventEmitter";
import { getProcessCtrl } from "./ProcessCtrl";
import { FalsyFun, Noop } from "./constants/Shared";
import { TweenManager } from "./tween/TweenManager";

let dispatcher = new EventEmitter();

/**
 * 在下一帧派发事件
 * @param event 
 * @param data 
 */
export function dispatchNext(event: EventType, data?: any, emitter?: EventDispatcher) {
    App.nextTick({
        context: emitter || dispatcher,
        callback: timerDispatch,
    }, event, data)
}

function timerDispatch(this: EventDispatcher, _: number, event: EventType, data?: any) {
    this.dispatch(event, data);
}

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
     * 返回webp扩展名
     */
    export let webpExt = function () {
        try {
            var supportWebp = (window as any).supportWebp == false ? false : document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0;
        } catch (err) { }

        const _webp = supportWebp ? Ext.WEBP : "";
        return _webp;
    }();

    /**
     * 特效级别
     * 0 关闭 除环境光以外的所有灯光 
     * 1 开启光
     */
    export let effect = GameEffect.Middle;

    /**
     * 获取Canvas，默认使用下面代码创建
     * ```js
     * document.createElement("canvas");
     * ```
     */
    export let getCanvas = function () {
        return document.createElement("canvas");
    }

    /**
     * 纹理缩放
     */
    export let graphicsScale = .5;

    export let width: number;

    export let height: number;

    export let innerWidth: number;

    export let innerHeight: number;

    export let tweenManager = new TweenManager;

    /**
     * 尝试复制  
     * 默认没有任何效果，在项目中进行赋值  
     */
    export let doCopy: typeof import("./utils/DomCopy").doCopy = FalsyFun;

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