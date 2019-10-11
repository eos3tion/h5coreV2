import { FHost } from "./FHost";
import { DataEvent } from "../../utils/EventEmitter";
import { ViewDele, ViewDeleEvent } from "./ViewDele";
import { pushOnce, removeFrom } from "../../utils/ArrayUtil";
import { on, off, App } from "../../../three/App";
import { Callback } from "../../utils/Callback";
import { TickFunction } from "../../utils/TimerUtils";


export interface ViewController {
    /**
     * 面板加入到舞台时执行
     */
    onAwake?(): any;
    /**
     * 面板从舞台移除时执行
     */
    onSleep?(): any;
}

export function regStageEvent(awakeEvent: Key, sleepEvent: Key) {

}

/**
 * 可以调用 @d_interest 的视图  
 * 可以进行关注facade中的事件
 * 
 * @export
 * @class ViewController
 * @extends {FHost}
 */
export class ViewController extends FHost {

    /**
     * 加载状态
     */
    protected _ready = false;

    /**
     * 关注列表
     */
    protected _interests: { [index: string]: Interest } = null;
    interestChecked = false;
    _awakeCallers: { (e?: DataEvent): any }[] = null;

    /**
     * 定时回调的列表
     */
    protected _tList: number[] = null;

    /**
     * 用于内部增加关注
     * 
     * @param {Key} eventType 
     * @param {{ (e?: egret.Event): void }} handler 
     * @param {boolean} [triggerOnStage] 
     */
    interest(eventType: Key, handler: { (e?: DataEvent): void }, triggerOnStage?: boolean) {
        let ins = <Interest>{};
        ins.handler = handler;
        ins.trigger = triggerOnStage;
        let _interests = this._interests;
        if (!_interests) {
            this._interests = _interests = {};
        }
        _interests[eventType] = ins;
        if (triggerOnStage) {
            let _awakeCallers = this._awakeCallers;
            if (!_awakeCallers) {
                this._awakeCallers = _awakeCallers = [];
            }
            pushOnce(_awakeCallers, handler);
        }
    }

    removeSkinListener(skin: ViewDele) {
        if (skin) {
            skin.off$(ViewDeleEvent.OnAwake, this.onStage, this);
            skin.off$(ViewDeleEvent.OnSleep, this.onStage, this);
        }
    }

    addSkinListener(skin: ViewDele) {
        if (skin) {
            skin.on$(ViewDeleEvent.OnAwake, this.onStage, this);
            skin.on$(ViewDeleEvent.OnSleep, this.onStage, this);
        }
    }

    /**
     * 绑定定时处理的回调函数
     *
     * @param {TickFunction} callback 执行回调函数
     * @param {boolean} [trigger=true] 是否理解执行 
     * @param {number} [time=Time.ONE_SECOND]
     * @param {any} [thisObj=this]
     * @param {any} args
     * @memberof ViewController
     */
    bindTimer(callback: TickFunction, trigger = true, time = Time.ONE_SECOND, thisObj = this, ...args: any[]) {
        let _tList = this._tList;
        if (!_tList) {
            this._tList = _tList = [];
        }
        let guid = App.addTick(time, {
            callback,
            context: thisObj,
            unique: true,
        }, ...args);
        _tList.push(guid);
        if (trigger) {
            callback.apply(thisObj, args);
        }
        return guid;
    }

    /**
     * 解除定时回调函数的绑定
     * @param callback 
     * @param time 
     * @param thisObj 
     */
    looseTimer(guid: number) {
        let list = this._tList;
        if (list) {
            removeFrom(list, guid);
            App.removeTick(guid);
        }
    }

    /**
     * 添加到舞台时，自动添加定时回调
     */
    awakeTimer() {
        let list = this._tList;
        if (list) {
            for (let i = 0; i < list.length; i++) {
                const guid = list[i];
                App.resumeTick(guid);
            }
        }
    }

    /**
     * 从舞台移除时候，自动移除定时回调
     */
    sleepTimer() {
        let list = this._tList;
        if (list) {
            for (let i = 0; i < list.length; i++) {
                const guid = list[i];
                App.pauseTick(guid);
            }
        }
    }

    public get isReady() {
        return this._ready;
    }
    onStage(e: DataEvent) {
        this.checkInterest();
        if (!this._ready) return;
        this.stageChange(e.type == ViewDeleEvent.OnAwake);
    }

    stageChange(onStage: boolean) {
        const _interests = this._interests;
        let type: string, ins: Interest;
        if (onStage) {
            //加入关注的事件
            for (type in _interests) {
                ins = _interests[type];
                on(type, ins.handler, this);
            }
            const _awakeCallers = this._awakeCallers;
            if (_awakeCallers) {
                for (let i = 0; i < _awakeCallers.length; i++) {
                    _awakeCallers[i].call(this);
                }
            }
            //检查timer绑定
            this.awakeTimer();
            if (this.onAwake) {
                this.onAwake();
            }
        } else {
            for (type in _interests) {
                ins = _interests[type];
                off(type, ins.handler, this);
            }
            this.sleepTimer();
            if (this.onSleep) {
                this.onSleep();
            }
        }
    }

    checkInterest() {
        if (!this.interestChecked) {
            let _awakeCallers = this._awakeCallers;
            if (!_awakeCallers) {
                this._awakeCallers = _awakeCallers = [];
            }
            const _interests = this._interests;
            for (let type in _interests) {
                let ins = _interests[type];
                if (ins.trigger) {
                    pushOnce(_awakeCallers, ins.handler);
                }
            }
            this.interestChecked = true;
        }
    }
}

export interface Interest {
    /**
     * 回调函数
     */
    handler: { (e?: DataEvent): any };

    /**
     * 
     * 添加到舞台的时候，立即执行一次回调函数
     * @type {boolean}
     */
    trigger: boolean;

    /**
     * 是否为私有监听，此值设置为true则子类不会继承事件监听  
     * 否则子类将继承事件监听
     */
    isPri?: boolean;
}

/**
 * 使用@d_interest 注入 添加关注
 * 关注为事件处理回调，只会在awake时，添加到事件监听列表
 * 在sleep时，从事件监听列表中移除
 * @param {Key} type                         关注的事件
 * @param {(e?: Event) => void} handler          回调函数
 * @param {boolean} [triggerOnStage=false]      添加到舞台的时候，会立即执行一次，`<font color="#f00">`注意，处理回调必须能支持不传event的情况`
 * @param {boolean} [isPrivate=false]           是否为私有方法，如果标记为私有方法，则不会被子类的关注继承
 */
export function d_interest(eventType: Key, triggerOnStage?: boolean, isPrivate?: boolean) {
    const pKey = "_interests";
    return function (target: any, _: string, value: any) {
        let _interests: { [eventType: string]: Interest };
        if (target.hasOwnProperty(pKey)) {
            _interests = target[pKey];
        } else {
            //未赋值前，先取值，可取到父级数据，避免使用  Object.getPrototypeOf(target)，ES5没此方法
            const inherit: { [eventType: string]: Interest } = target[pKey];
            target[pKey] = _interests = {};
            if (inherit) {//继承父级可继承的关注列表
                for (let k in inherit) {
                    let int = inherit[k];
                    if (!int.isPri) {
                        _interests[k] = int;
                    }
                }
            }
        }
        _interests[eventType] = { handler: value.value, trigger: triggerOnStage, isPri: isPrivate };
    }
}