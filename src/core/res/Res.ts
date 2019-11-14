import { Callback } from "../utils/Callback";
import { EventEmitter, DataEvent } from "../utils/EventEmitter";
import { Recyclable, recyclable } from "../utils/ClassUtils";
import { parsePath } from "../utils/Path";
import { appendTo, removeFrom, pushOnce } from "../utils/ArrayUtil";
import { ThrowError } from "../debug/ThrowError";
import { dispatch } from "../../three/App";
import { getTimer } from "../utils/DateUtils";

let requestRef: { new(): IHttpRequest };
export function setRequest(ref: { new(): IHttpRequest }) {
    requestRef = ref;
}

const enum Const {
    /**
     * 默认的失败超时时间
     */
    FailedExpiredTime = 10000,

    /**
     * 默认的单个资源，不做延迟重试的最大重试次数
     */
    MaxRetry = 3,
    /**
     * 默认的最大加载线程数
     */
    MaxThread = 6,
}







/**
 * 资源加载的回调
 */
export type ResCallback = Callback<{ (resItem: ResItem, ...args: any): any }>;

export interface ResBase {

    /**
     * 资源标识
     */
    uri: string;
    /**
     * 资源路径
     */
    url?: string;
    /**
     * 数据
     */
    data?: any;
    version?: number;
}

export interface TypedResItem<T> extends ResItem {
    data: T;
}

export interface ResItem extends ResBase {
    /**
     * 资源类型
     */
    type?: ResItemType;
    /**
     * 是否已存储本地缓存
     */
    local?: boolean;

    /**
     * 不使用本地缓存
     */
    noLocal?: boolean;
    /**
     * 资源正在加载时所在的组  
     * 加载完成后清理此值
     */
    qid?: ResQueueID;

    /**
     * 失败重试次数
     */
    retry?: number;
    /**
     * 资源加载状态  
     * 默认为 UnRequest
     */
    state?: RequestState;

    /**
     * 上次失败的过期时间  
     * 网络有时候不稳定，这次连续加载不到，但是后面可能能加载到
     *
     * @type {number}
     * @memberof ResItem
     */
    ft?: number;

    /**
     * 是否被移除
     */
    removed?: boolean;

    /**
     * 分组标识  
     * 用于对资源进行区分
     */
    group?: Key;

    /**
     * 资源回调列队
     */
    callbacks?: ResCallback[];
}

export const enum QueueLoadType {
    /**
     * 先入后出
     */
    FILO,
    /**
     * 先入先出
     */
    FIFO,

}

export function setResItemState(resItem: ResItem, newState: RequestState) {
    let state = resItem.state;
    if (!resItem.removed) {
        state = newState;
    }
    resItem.state = state;
}

/**
 * 资源分组
 */
export interface ResQueue {
    /**
     * 分组名称
     */
    id: Key;

    /**
     * 分组优先级
     */
    priority?: number;

    /**
     * 分组中的列表
     */
    list: ResItem[];

    /**
     * 加载类型
     */
    type: QueueLoadType;
}

/**
 * 内置的资源分组
 */
export const enum ResQueueID {
    /**
     * 常规资源，使用 FIFO
     * 适合当前地图块，普通怪物资源，特效资源等
     */
    Normal,
    /**
     * 后台加载资源，使用 FILO
     * 用于后台加载，最低优先级
     */
    Backgroud,
    /**
     * 高优先级资源
     * FIFO
     */
    Highway,
}



/**
 * 资源加载完成的回调
 */
export type ResLoadCallback = Callback<{ (item: ResItem, ...args: any[]): any }>;

export interface ResLoader {
    /**
     * 加载完成的回调
     */
    loadFile(resItem: ResItem, callback: ResLoadCallback): any;

}

/** 
 * 内部实现的ResLoader
 */
export interface InternalResLoader extends ResLoader {

    /**
     * 加载完成的回调
     */
    onLoadFinish(e: DataEvent): any;
}

export interface ResRequest extends EventEmitter {
    item?: ResItem;
    resCB?: ResLoadCallback
}
export type ResHttpRequest = Recyclable<IHttpRequest & ResRequest>;


export module Res {
    export function checkItemState(item: ResItem, event: DataEvent) {
        let state = item.state;
        if (!item.removed) {
            state = event.type == EventConst.Complete ? RequestState.Complete : RequestState.Failed;
        }
        item.state = state;
        return state;
    }

    export function bindRequest(loader: InternalResLoader, request: ResRequest, item: ResItem, callback: ResLoadCallback) {
        request.on(EventConst.Complete, loader.onLoadFinish, loader);
        request.on(EventConst.Error, loader.onLoadFinish, loader);
        request.item = item;
        request.resCB = callback;
    }

    export function looseRequest(loader: InternalResLoader, request: ResRequest & { recycle?(): any }) {
        request.off(EventConst.Complete, loader.onLoadFinish, loader);
        request.off(EventConst.Error, loader.onLoadFinish, loader);
        request.item = undefined;
        request.resCB = undefined;
        request.recycle && request.recycle();
    }

    export class BinLoader implements ResLoader {
        type: HttpResponseType;
        constructor(type = HttpResponseType.ArrayBuffer) {
            this.type = type;
        }
        loadFile(resItem: ResItem, callback: ResLoadCallback) {
            let request = recyclable(requestRef) as ResHttpRequest;
            bindRequest(this, request, resItem, callback);
            request.request({
                url: resItem.url,
                responseType: this.type,

            })
        }

        onLoadFinish(event: DataEvent) {
            let request = event.target as ResHttpRequest;
            let { item, resCB, response } = request;
            looseRequest(this, request);
            let state = checkItemState(item, event);
            if (state == RequestState.Complete) {
                item.data = this.parseResponse(response);
            }
            resCB.callAndRecycle(item);
        }

        parseResponse(response: any) {
            return response;
        }
    }

    /**
     *  失败的超时时间
     */
    let failedExpiredTime = Const.FailedExpiredTime;
    /**
     * 设置失败的过期时间  
     * 失败次数超过`maxRetry`
     * @export
     * @param {number} second
     */
    export function setFailedExpired(second: number) {
        let time = ~~second * Time.ONE_SECOND;
        if (time <= 0) {//如果为小于0的时间，则将时间设置为1分钟过期
            time = Const.FailedExpiredTime;
        }
        failedExpiredTime = time;
    }


    /**
     * 最大重试次数
     */
    let maxRetry = Const.MaxRetry;


    /**
     * 最大加载数量
     * 目前所有主流浏览器针对 http 1.1 单域名最大加载数均为6个  
     * http2 基本无限制
     */
    let maxThread = Const.MaxThread;


    /**
     * 扩展名和类型的绑定字典
     */
    const extTypeDict: { [ext: string]: ResItemType } = {
        [Ext.JPG]: ResItemType.Image,
        [Ext.PNG]: ResItemType.Image,
        [Ext.WEBP]: ResItemType.Image,
        [Ext.JSON]: ResItemType.Json,
        [Ext.BIN]: ResItemType.Binary,
        [Ext.MP3]: ResItemType.Sound,
    }

    let getResUrl: { (uri: string): string } = url => url;

    /**
     * 设置路径处理函数
     * @param handler 
     */
    export function setUrlParser(handler: { (uri: string): string }) {
        getResUrl = handler;
    }

    const binLoader = new BinLoader();

    /**
     * 资源字典  
     * Key {Key} 资源标识  
     * Value {ResItem} 资源
     * 
     */
    const resDict: { [resID: string]: ResItem } = {};

    /**
     * 加载器字典  
     * Key {number}             加载器类型
     * Value {ResAnalyzer}      加载器
     */
    const loaderMap: { [type: number]: ResLoader } = {
        [ResItemType.Binary]: binLoader,
        [ResItemType.Text]: new BinLoader(HttpResponseType.Text),
        [ResItemType.Json]: new BinLoader(HttpResponseType.JSON),
    }

    /**
     * 注册资源加载器
     * @param type 资源类型
     * @param loader 资源加载器
     */
    function regLoader(type: ResItemType, loader: ResLoader) {
        loaderMap[type] = loader;
    }

    /**
     * 内联绑定
     * @param ext 扩展名
     * @param type 类型
     */
    function bindExtType(type: ResItemType, ...exts: string[]) {
        for (let i = 0; i < exts.length; i++) {
            const ext = exts[i];
            extTypeDict[ext] = type;
        }
    }

    export function bind(type: ResItemType, loader: ResLoader, ...exts: string[]) {
        regLoader(type, loader);
        bindExtType(type, ...exts);
    }

    /**
     * 根据 url 获取资源的处理类型
     * @param url 
     */
    function getType(url: string) {
        let path = parsePath(url);
        let ext = path.ext;
        return ~~extTypeDict[ext];//默认使用binary类型
    }


    /**
     * 加载列队的总数
     */
    const queues: { [groupID: string]: ResQueue } = {};

    /**
     * 失败的资源加载列队
     */
    const failedList: ResItem[] = [];

    /**
     * 获取或创建一个加载列队
     * @param queueID 
     * @param list 
     * @param priority 
     */
    function getOrCreateQueue(queueID: Key, type = QueueLoadType.FIFO, priority?: number, list?: ResItem[]) {
        let old = queues[queueID];
        if (old) {//已经存在
            if (list) {
                appendTo(list, old.list);
            }
            return old;
        }
        list = list || [];
        priority = ~~priority;
        let queue = { id: queueID, list, priority, type };
        queues[queueID] = queue;
        return queue;
    }

    //创建内置分组
    getOrCreateQueue(ResQueueID.Highway, QueueLoadType.FIFO, 9999);
    getOrCreateQueue(ResQueueID.Normal);
    getOrCreateQueue(ResQueueID.Backgroud, QueueLoadType.FILO, -9999);

    /**
     * addRes方法的返回值
     */
    const addResResult: [ResItem, boolean] = [] as any;

    /**
     * 添加资源的结果  
     * 0 号为返回值
     *
     * @export
     * @interface AddResResult
     * @extends {Array<any>}
     */
    export interface AddResResult extends Array<any> {
        readonly 0: ResItem;
        readonly 1: boolean;
        length: 2;
    }

    /**
     * 添加资源
     * @param {ResItem} resItem 
     * @param {ResQueueID} [queueID=ResQueueID.Normal]
     * @returns {ResItem}
     */
    export function addRes(resItem: ResItem, queueID = ResQueueID.Normal): AddResResult {
        let { uri, url } = resItem;
        let old = resDict[uri];
        addResResult[1] = false;
        if (!url) {
            url = getResUrl(uri);
        }
        if (old) {
            if (old != resItem && old.url != url) {
                DEBUG && ThrowError(`资源[${uri}]重名，加载路径分布为[${old.url}]和[${url}]`);
            } else {//资源和加载路径完全相同
                let state = old.state;
                if (state >= RequestState.Requesting) { //正在处理的资源和已经加载完毕的资源，无需添加到任何列队
                    addResResult[0] = old;
                    return addResResult;
                }
            }
            resItem = old;
        } else {
            resItem.url = url;
            resDict[uri] = resItem;
        }
        addResResult[0] = resItem;
        let oQID = resItem.qid;
        if (oQID != queueID) {
            let oQueue = queues[oQID];
            if (oQueue) {//从旧列表中移除
                removeFrom(oQueue.list, resItem);
            }
            //更新列表
            resItem.qid = queueID;
            let queue = getOrCreateQueue(queueID);
            pushOnce(queue.list, resItem);
            addResResult[1] = true;
        }
        return addResResult;
    }

    /**
      * 加载资源
      * @param {string} uri 资源标识
      * @param {ResCallback} callback 加载完成的回调
      * @param {string} [url] 资源路径
      * @param {ResQueueID} [queueID=ResQueueID.Normal]
      */
    export function load(uri: string, url?: string, callback?: ResCallback, queueID = ResQueueID.Normal) {
        //检查是否已经有资源
        let item = resDict[uri];
        if (!item) {
            item = { uri, url, type: getType(uri) }
        }
        loadRes(item, callback, queueID);
    }

    /**
      * 加载资源
      * @param {ResItem} resItem 
      * @param {ResQueueID} [queueID=ResQueueID.Normal]
      */
    export function loadRes(resItem: ResItem, callback?: ResCallback, queueID = ResQueueID.Normal) {
        [resItem] = addRes(resItem, queueID);
        let state = resItem.state;
        if (state == RequestState.Complete || (state == RequestState.Failed && resItem.retry > maxRetry && getTimer() < ~~resItem.ft)) {//已经加载完成的资源，直接在下一帧回调
            return callback && setTimeout(function () { callback.callAndRecycle(resItem) }, 0) //Global.nextTick(callback.callAndRecycle, callback, resItem);// callback.callAndRecycle(resItem);
        }
        resItem.removed = false;
        if (callback) {
            let list = resItem.callbacks;
            if (!list) {
                resItem.callbacks = list = [];
            }
            list.push(callback);
        }
        return next();
    }

    /**
     * 获取下一个要加载的资源
     */
    function getNext() {
        let next: ResItem;
        //得到优先级最大并且
        let high = -Infinity;
        let highQueue: ResQueue;
        for (let key in queues) {//同优先级的列队，基于hash规则加载，一般来说只用内置的3个列队即可解决常规问题
            let queue = queues[key];
            if (queue.list.length) {
                let priority = queue.priority;
                if (priority > high) {
                    high = priority;
                    highQueue = queue;
                }
            }
        }
        if (highQueue) {
            //检查列队类型
            let list = highQueue.list;
            switch (highQueue.type) {
                case QueueLoadType.FIFO:
                    next = list.shift();
                    break;
                case QueueLoadType.FILO:
                    next = list.pop();
                    break;
            }
        }

        if (!next) {
            if (failedList.length > 0) {//失败列队最后加载
                next = failedList.shift();
            }
        }

        return next;
    }

    /**
     * 正在加载的资源列队
     */
    const loading: ResItem[] = [];

    function next() {
        let now = getTimer();
        while (loading.length < maxThread) {
            let item = getNext();
            if (!item) break;
            pushOnce(loading, item);
            let state = ~~item.state;
            if (state == RequestState.Failed && item.ft < now) {//如果失败时间已经超过了失败过期时间，则重新加载
                state = RequestState.UnRequest;
            }
            switch (state) {
                case RequestState.Failed:
                case RequestState.Complete:
                    onItemComplete(item);
                    break;
                case RequestState.UnRequest://其他情况不处理
                    let type = item.type;
                    if (type == undefined) {
                        type = getType(item.url);
                    }
                    let loader = loaderMap[type];
                    if (!loader) {
                        loader = binLoader;
                    }
                    //标记为加载中
                    item.state = RequestState.Requesting;
                    loader.loadFile(item, Callback.get(onItemComplete));
                    break;
            }
        }
    }

    /**
     * 资源加载结束，执行item的回调
     * @param item 
     */
    function doCallback(item: ResItem) {
        let callbacks = item.callbacks;
        if (callbacks) {//执行回调列队
            item.callbacks = undefined;
            for (let i = 0; i < callbacks.length; i++) {
                let cb = callbacks[i];
                cb.callAndRecycle(item);
            }
        }
    }

    function onItemComplete(item: ResItem) {
        removeFrom(loading, item);
        item.qid = undefined;
        let state = ~~item.state;
        if (state == RequestState.Failed) {
            let retry = item.retry || 1;
            if (retry > maxRetry) {
                let now = getTimer();
                let ft = ~~item.ft;
                if (now > ft) {
                    item.ft = failedExpiredTime * (retry - maxRetry) + now;
                }
                doCallback(item);
                return dispatch(EventConst.ResLoadFailed, item);
            }
            item.retry = retry + 1;
            item.state = RequestState.UnRequest;
            failedList.push(item);
        } else if (state == RequestState.Complete) {
            //加载成功，清零retry
            item.retry = 0;
            //检查资源是否被加入到列队中
            doCallback(item);
            dispatch(EventConst.ResLoadSuccess, item);
        }
        return next();
    }

    /**
     * 设置单个资源，不做延迟重试的最大重试次数，默认为3
     * @param val 
     */
    export function setMaxRetry(val: number) {
        maxRetry = val;
    }
    /**
     * 设置最大加载线程  默认为 6
     * @param val 
     */
    export function setMaxThread(val: number) {
        maxThread = val;
    }
    /**
     * 同步获取某个资源，如果资源未加载完成，则返回空
     * @param uri 资源标识
     */
    export function get(uri: string) {
        let item = resDict[uri];
        if (item && item.state == RequestState.Complete) {
            return item.data;
        }
    }

    export function set(uri: string, item: ResItem) {
        if (!resDict[uri]) {
            resDict[uri] = item;
            return true;
        }
    }

    /**
     * 移除某个资源
     * @param uri 
     */
    export function remove(uri: string) {
        let item = resDict[uri];
        removeItem(item);
    }

    function removeItem(item: ResItem) {
        if (item) {
            delete resDict[item.uri];
            let qid = item.qid;
            let queue = queues[qid];
            if (queue) {
                removeFrom(queue.list, item);
            }
            item.removed = true;
        }
    }

    /**
     * 阻止尝试某个资源加载，目前是还未加载的资源，从列队中做移除，其他状态不处理
     * @param uri 
     */
    export function cancel(uri: string) {
        let item = resDict[uri];
        if (item) {
            if (item.state == RequestState.UnRequest) {
                let qid = item.qid;
                let queue = queues[qid];
                if (queue) {
                    removeFrom(queue.list, item);
                }
                doCallback(item);
            }
        }
    }
    interface LoadResListParam extends LoadResListOption {
        /**
         * 加载进度
         */
        current: number;
        /**
         * 总量
         */
        total: number;

        list: ResItem[];
    }
    export function loadList(list: ResItem[], opt: LoadResListOption, queueID = ResQueueID.Normal) {
        let total = list.length;
        if (total) {
            let group = opt.group;
            (opt as LoadResListParam).current = 0;
            (opt as LoadResListParam).total = total;
            (opt as LoadResListParam).list = list;
            for (let i = 0; i < total; i++) {
                let item = list[i];
                item.group = group;
                loadRes(item, Callback.get(doLoadList, null, opt), queueID);
            }
        } else {
            opt.callback.callAndRecycle(true);
        }
    }

    function doLoadList(item: ResItem, param: LoadResListParam) {
        let callback = param.callback;
        if (!callback) {
            return;
        }
        let group = param.group;
        if (item.group == group) {
            let onProgress = param.onProgress;
            let doRec: boolean, flag: boolean;
            if (item.state == RequestState.Failed) {
                doRec = true;
                flag = false;
            } else {
                param.current++;
                onProgress && onProgress.call(item);
                if (param.current >= param.total) {
                    doRec = true;
                    flag = true;
                }
            }
            if (doRec) {
                param.callback = undefined;
                param.onProgress = undefined;
                callback.callAndRecycle(flag);
                onProgress && onProgress.recycle();
                let list = param.list;
                if (!flag && list) {
                    list.forEach(removeItem)
                }
            }
        }
    }
}

export interface LoadResListOption {

    callback: Callback<{ (flag: boolean, ...args: any[]): any }>;
    group: Key;
    onProgress?: Callback<{ (item: ResItem): any }>;
}

