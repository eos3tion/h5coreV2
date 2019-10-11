import { IRecyclable, recyclable } from "./ClassUtils";
import { ThrowError } from "../debug/ThrowError";

interface DebugInfo {
    handle: string;
    stack: string;
}

function call(info: $Callback, ars?: ArrayLike<any>) {
    let args = [];
    let i = 0;
    if (ars) {
        for (; i < ars.length; i++) {
            args[i] = ars[i];
        }
    }
    let argus = info.args;
    if (argus) {
        for (let j = 0; j < argus.length; j++) {
            args[i++] = argus[j];
        }
    }
    let callback = info.callback;
    if (callback != undefined) {
        try {
            return callback.apply(info.context, args);
        } catch (e) {
            if (DEBUG) {
                let debug = info._debug;
                ThrowError(`CallbackInfo执行报错，赋值内容：============Function=============:\n${debug.handle}\n}==============Stack============:\n${debug.stack}\n当前堆栈：${e.stack}`);
                console.log("参数列表", ...args);
            }
        }
    } else if (DEBUG) {
        let debug = info._debug;
        ThrowError(`对已回收的CallbackInfo执行了回调，最后一次赋值内容：============Function=============:\n${debug.handle}\n==============Stack============:\n${debug.stack}\n当前堆栈：${new Error().stack}`)
    }
}

export type $Callback = Callback<Function>;

/**
 * 回调信息，用于存储回调数据
 * @author 3tion
 *
 */
export class Callback<T extends Function> implements IRecyclable {
    callback: T = null;
    args: any[] = null;
    context: any = null;

    doRecycle = true;

    /**
     * 仅在调试版本有效
     */
    _debug?: DebugInfo;
    constructor() {
        if (DEBUG) {
            this._debug = null;
            let data: PropertyDescriptor = { enumerable: true, configurable: true };
            data.get = function (this: any) {
                return this._cb;
            }
            data.set = function (this: any, value: T) {
                if (this._cb != value) {
                    this._cb = value;
                    if (value != undefined) {
                        this._debug = { handle: value.toString(), stack: new Error().stack };
                    }
                }
            }
            Object.defineProperty(this, "callback", data);
        }
    }

    init(callback: T, thisObj?: any, args?: any[]) {
        this.callback = callback;
        this.args = args;
        this.context = thisObj;
    }

    /**
     * 检查回调是否一致，只检查参数和this对象,不检查参数
     */
    checkHandle(callback: T, thisObj: any) {
        return this.callback === callback && this.context == thisObj/* 允许null==undefined */;
    }

    /**
     * 执行回调
     * 回调函数，将以args作为参数，callback作为函数执行
     * @param {boolean} [doRecycle] 是否回收CallbackInfo，默认为true
     */
    execute(doRecycle?: boolean) {
        let result = call(this);
        if (doRecycle == undefined) {
            doRecycle = this.doRecycle;
        }
        if (doRecycle) {
            this.recycle();
        }
        return result;
    }

    /**
     * 用于执行其他参数
     * 初始的参数会按顺序放在末位
     * @param args (description)
     */
    call(...args: any[]): any
    call() {
        return call(this, arguments);
    }

    /**
     * 用于执行其他参数
     * 初始的参数会按顺序放在末位
     * 此方法会回收callbackInfo
     * @param {any} args 
     */
    callAndRecycle(...args: any[]): any
    callAndRecycle() {
        let result = call(this, arguments);
        this.recycle();
        return result;
    }

    onRecycle() {
        this.callback = undefined;
        this.args = undefined;
        this.context = undefined;
        this.doRecycle = true;
    }


    recycle: { (): any };

    /**
     * 获取CallbackInfo的实例
     */
    static get<T extends Function>(callback: T, thisObj?: any, ...args: any[]) {
        var info = recyclable(Callback);
        info.init(callback, thisObj, args);
        return info as Callback<T>;
    }

    static checkList<T extends Function>(list: Callback<T>[], callback: T, thisObj?: any) {
        for (let i = 0, len = list.length; i < len; i++) {
            let handler = list[i];
            if (handler.checkHandle(callback, thisObj)) {
                return handler;
            }
        }
    }

    /**
     * 加入到数组
     * 检查是否有this和handle相同的callback，如果有，就用新的参数替换旧参数
     * @param list
     * @param handle
     * @param args
     * @param thisObj
     */
    static addToList<T extends Function>(list: Callback<T>[], handle: T, thisObj?: any, ...args: any[]) {
        //检查是否有this和handle相同的callback
        let callback = this.checkList(list, handle, thisObj);
        if (callback) {
            callback.args = args;
        } else {
            callback = this.get(handle, thisObj, ...args);
            list.push(callback);
        }
        return callback;
    }

    /**
     * 从列表中移除
     *
     * @static
     * @template T
     * @param {Callback<T>[]} list
     * @param {T} handle
     * @param {*} [thisObj]
     * @returns
     * @memberof CallbackInfo
     */
    static removeFromList<T extends Function>(list: Callback<T>[], handle: T, thisObj?: any) {
        let j = -1;
        let info: Callback<T>;
        for (let i = 0, len = list.length; i < len; i++) {
            let callback = list[i];
            if (callback.checkHandle(handle, thisObj)) {
                j = i;
                info = callback;
                break;
            }
        }
        if (info) {
            list.splice(j, 1);
        }
        return info;
    }
}