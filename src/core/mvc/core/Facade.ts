import { ModuleManager } from "../module/ModuleManager";
import { Proxy } from "./Proxy";
import { Mediator } from "./Mediator";
import { FHost } from "./FHost";
import { ThrowError } from "../../debug/ThrowError";
import { Noop } from "../../constants/Shared";

function getNameOfInline(inlineRef: { new(): any }, className?: string): string {
    className = className || inlineRef.name;
    let name: string;
    if ("NAME" in inlineRef) {//如果有 export function static NAME 取这个作为名字
        name = inlineRef["NAME"];
    } else {
        name = className.substr(className.lastIndexOf(".") + 1);
    }
    return name;
}



/**
 * 存储的数据Proxy
 */
const _proxys: { [index: string]: ScriptHelper<Proxy> } = {};

/**
 * 存储的Mediator
 */
const _mediators: { [index: string]: ScriptHelper<Mediator> } = {};


/**
 * 模块管理器
 */
let _mm: ModuleManager;


/**
 * 绑定模块管理器
 */
export function bindModuleManager(mm: ModuleManager) {
    mm.init();
    _mm = mm;
}

/**
 * 模块管理器
 * 
 * @readonly
 * 
 * @memberOf Facade
 */
export function getMM() {
    return _mm;
}

function _removeHost(name: Key, dict: { [index: string]: ScriptHelper<FHost> }) {
    let dele = dict[name];
    let host: FHost;
    if (dele) {
        delete dict[name];
        host = dele.host;
        if (host) {
            host.onRemove();
        }
    }
    return host;
}

/**
 * 移除面板控制器
 */
export function removeMediator(mediatorName: Key) {
    return _removeHost(mediatorName, _mediators);
}


/**
 * 移除模块  
 * 如果模块被其他模块依赖，此方法并不能清楚依赖引用
 */
export function removeProxy(proxyName: Key) {
    let proxy = _proxys[proxyName];
    if (proxy.host._$isDep) {
        DEBUG && ThrowError(`模块[${proxyName}]被依赖，不允许移除`, null, true);
        return
    }
    return _removeHost(proxyName, _proxys);
}

/**
 * 
 * 注册内部模块
 * @param ref Proxy创建器
 * @param proxyName 模块名称
 * @param async 是否异步初始化，默认直接初始化
 */
export function registerInlineProxy(ref: typeof Proxy, proxyName: Key, async?: boolean) {
    if (!ref) {
        if (DEBUG) {
            ThrowError("registerInlineProxy时,没有ref")
        }
        return
    }
    regConfig(ref, proxyName, _proxys);
    if (!async) { //如果直接初始化
        let dele = _proxys[proxyName];
        let host = new ref(proxyName);
        dele.host = host;
        inject(host);
        host.onRegister();
    }
}

/**
 * 
 * 注册内部Mediator模块
 * @param ref Mediator创建器
 * @param mediatorName   注册的模块名字
 */
export function registerInlineMediator(ref: typeof Mediator, mediatorName: Key) {
    if (!ref) {
        if (DEBUG) {
            ThrowError(`registerInlineMediator时,没有ref`)
        }
        return
    }
    regConfig(ref, mediatorName, _mediators);
}

function regConfig<T extends FHost>(clazz: string | typeof FHost, key: Key, dict: { [key: string]: ScriptHelper<T> }, url?: string) {
    let dele: ScriptHelper<T>;
    if (DEBUG) {
        dele = dict[key];
        if (dele) {
            ThrowError("模块定义重复:" + name);
        }
    }
    dele = <ScriptHelper<T>>{};
    if (typeof clazz === "string") {
        dele.className = clazz;
    } else {
        dele.ref = clazz;
    }
    dele.name = key;
    dele.url = url;
    dict[key] = dele;
}


/**
 * 获取Proxy
 * 
 * @param {Key} proxyName proxy的名字
 * @param {{ (proxy: Proxy, args?: any[]) }} callback 回调函数
 * @param {*} thisObj 回调函数的this对象
 * @param args 回调函数的参数列表
 */
export function getProxy(proxyName: Key, callback?: { (proxy: Proxy, ...args: any[]): any }, thisObj?: any, ...args: any[]) {
    let dele = _proxys[proxyName];
    if (!dele) {
        if (DEBUG) {
            ThrowError("没有注册proxy的关系");
        }
        return
    }
    let bin = <ScriptSolveBin>{};
    bin.dele = dele;
    bin.callback = callback;
    bin.thisObj = thisObj;
    bin.args = args;
    return _getHost(bin);
}

/**
 * 以同步方式获取proxy，不会验证proxy是否加载完毕  
 * 有可能无法取到proxy
 * 
 * @param {Key} proxyName 
 * @returns 
 * 
 * @memberOf Facade
 */
export function getProxySync(proxyName: Key) {
    let dele = _proxys[proxyName];
    if (dele) {
        return dele.host;
    }
}

/**
 * 获取Mediator
 * 
 * @param {Key} moduleID 模块ID
 * @param {{ (proxy: Proxy, args?: any[]) }} callback 回调函数
 * @param {*} thisObj 回调函数的this对象
 * @param args 回调函数的参数列表
 */
export function getMediator(moduleID: Key, callback?: { (mediator: Mediator, ...args: any[]): any }, thisObj?: any, ...args: any[]) {
    let dele = _mediators[moduleID];
    if (!dele) {
        if (DEBUG) {
            ThrowError("没有注册Mediator的关系");
        }
        return
    }
    let bin = <ScriptSolveBin>{};
    bin.dele = dele;
    bin.callback = callback;
    bin.thisObj = thisObj;
    bin.args = args;
    return _getHost(bin);
}

/**
 * 以同步方式获取Mediator，不会验证Mediator是否加载完毕  
 * 有可能无法取到Mediator
 * 
 * @param {Key} moduleID 
 * @returns 
 * 
 * @memberOf Facade
 */
export function getMediatorSync(moduleID: Key) {
    let dele = _mediators[moduleID];
    if (dele) {
        return dele.host;
    }
}


function _getHost(bin: ScriptSolveBin) {
    let dele = bin.dele;
    let host = dele.host;
    if (!host) {
        let ref = dele.ref;
        if (!ref) {
            dele.ref = ref = getRefByName(dele.className);
        }
        dele.host = host = new ref(dele.name);
        inject(host);
        host.onRegister();
    }
    let callback = bin.callback;
    if (host.isReady) {
        callback && callback.call(bin.thisObj, host, ...bin.args);
    } else {
        callback && host.addReadyExecute(callback, bin.thisObj, host, ...bin.args);
        host.startSync();
    }
    return host;
}


/**
 * 
 * 打开/关闭指定模块
 * @param {(Key)} moduleID      模块id
 * @param {ToggleState} [toggleState]      0 自动切换(默认)<br/>  1 打开模块<br/> -1 关闭模块<br/>  
 * @param {boolean} [showTip=true]          是否显示Tip
 * @param {ModuleParam} [param] 模块参数
 * 
 * @memberOf Facade
 */
export function toggle(moduleID: Key, toggleState?: ToggleState, showTip = true, param?: ModuleParam) {
    if (_mm) {
        _mm.toggle(moduleID, toggleState, showTip, param);
    }
}



/**
 * 
 * 执行某个模块的方法
 * @param {string} moduleID     模块id
 * @param {boolean} showTip     是否显示Tip，如果无法执行，是否弹出提示
 * @param {string} handlerName  执行的函数名
 * @param {boolean} [show]      执行时，是否将模块显示到舞台
 * @param {any[]} args            函数的参数列表
 * @returns
 */
export function executeMediator(moduleID: Key, showTip: boolean, handlerName: string, show?: boolean, ...args: any[]) {
    if (_mm && _mm.isModuleOpened(moduleID, showTip)) {
        let hander = show ? _executeAndShowMediator : _executeMediator;
        return getMediator(moduleID, hander, this, handlerName, ...args);
    }
}

/**
 * 不做验证，直接执行mediator的方法
 * 此方法只允许ModuleHandler使用
 * @function
 * @param name          模块id
 * @param showTip       如果无法执行，是否弹出提示
 * @param handlerName   执行的函数名
 * @param args
 */
export function $executeMediator(moduleID: string, handlerName: string, ...args: any[]) {
    return getMediator(moduleID, _executeMediator, this, handlerName, args);
}

function _executeMediator(mediator: Mediator, handlerName: string, ...args: any[]) {
    if (typeof mediator[handlerName] === "function") {
        (<Function>mediator[handlerName]).apply(mediator, args);
    } else if (DEBUG) {
        ThrowError("无法在Mediator：" + mediator.name + "中找到方法[" + handlerName + "]");
    }
}

function _executeAndShowMediator(mediator: Mediator, handlerName: string, ...args: any[]) {
    toggle(mediator.name, ToggleState.SHOW, false);//showTip为 false是不用再次提示，executeMediator已经执行过模块是否开启的检查
    _executeMediator(mediator, handlerName, ...args);
}


/**
 * 执行Proxy的方法
 * @param name     proxy名字
 * @param handlerName   函数名字
 * @param args          参数列表
 */
export function executeProxy(proxyName: Key, handlerName: string, ...args: any[]) {
    return getProxy(proxyName, _executeProxy, this, handlerName, ...args);
}

function _executeProxy(proxy: Proxy, handlerName: string, ...args: any[]) {
    if (typeof proxy[handlerName] === "function") {
        (<Function>proxy[handlerName]).apply(proxy, args);
    } else if (DEBUG) {
        ThrowError("无法在Proxy：" + proxy.name + "中找到方法[" + handlerName + "]");
    }
}

/**
 * 正在注入的对象
 */
let _indecting: any[] = [];

let injectHandler: { (obj: any): any } = Noop;

export function setInjectHandler(value: { (obj: any): any }) {
    injectHandler = value;
}

/**
 * 注入数据
 */
function inject(obj: any) {
    //锁定对象，防止循环注入
    if (!~_indecting.indexOf(obj)) {
        _indecting.push(obj);
        injectHandler(obj);
        let idx = _indecting.indexOf(obj);
        _indecting.splice(idx, 1);
    }
}


let _refByName: { (name: string): { new(): any } };

export function setRefByNameHandler(value: { (name: string): { new(): any } }) {
    _refByName = value;
}

/**
 * 根据名字获取引用
 * @param name 
 */
export function getRefByName(name: string): any {
    if (_refByName) {
        return _refByName(name);
    }
    return FHost;
}


export interface ScriptHelper<T extends FHost> {

    /**
     * 主体的类名字
     */
    className: string;

    /**
     * 名字
     */
    name: Key;

    /**
     * 数据主体
     */
    host: T;

    /**
     * 创建器
     */
    ref?: typeof FHost;

    url?: string;
}

interface ScriptSolveBin {
    /**
     * 
     * 脚本代理
     * @type {ScriptHelper<FHost>}
     */
    dele: ScriptHelper<FHost>;
    /**
     * 
     * 回调函数
     * @type {{ (m: FHost, args?: any[]) }}
     */
    callback: { (m: FHost, ...args: any[]): any };
    /**
     * 
     * 函数的this指针
     * @type {*}
     */
    thisObj: any;
    /**
     * 
     * 参数列表
     * @type {any[]}
     */
    args: any[];
    /**
     * 
     * Mediator专用参数，回调后是否将Mediator对应视图显示在舞台
     * @type {boolean}
     */
    show?: boolean;
}


export const enum ToggleState {
    HIDE = -1,
    AUTO = 0,
    SHOW = 1
}