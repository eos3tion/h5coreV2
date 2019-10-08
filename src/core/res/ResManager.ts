import { Res } from "./Res";

/**
 * 基于时间回收的资源
 */
export interface IResource {
    /**
     * 是否为静态不销毁资源
     */
    isStatic?: boolean;
    /**
     * 最后使用的时间戳
     */
    lastUseTime: number;
    /**
     * 资源id
     */
    uri: string;

    /**
     * 资源路径
     */
    url: string;

    /**
     * 销毁资源
     */
    dispose(): any;
}
const enum ResourceManagerConst {
    /**
     * 默认资源检测时间
     */
    CheckTime = 30000,
    /**
     * 默认销毁时间，5分钟之内资源没有被使用过，直接销毁
     */
    DisposeTime = 300000
}
/**
 * 资源管理器
 */

const _resources: { [index: string]: IResource } = {};


let disposeTime = ResourceManagerConst.DisposeTime;

export const ResManager = {
    /**
     * 基于资源id，获取指定的资源
     */
    get,
    /**
     * 获取资源
     */
    getResource,

    /**
     * 注册资源
     */
    regResource,

    /**
     * 初始化
     * @param time 设置资源销毁的时间(单位：毫秒)，至少大于检查时间 `30秒`  
     */
    init(time: number = ResourceManagerConst.DisposeTime) {
        if (time < ResourceManagerConst.CheckTime) {
            time = ResourceManagerConst.CheckTime;
        }
        disposeTime = time;
    },

    /**
     * 检查资源
     */
    checkRes(now: number) {
        let expire = now - disposeTime;
        disposeRes(res => !res.isStatic && res.lastUseTime < expire);
    },

    /**
     * 强制gc  
     * 清理所有未使用的资源
     */
    gc() {
        disposeRes(res => !res.isStatic);
    },
    /**
     * 从删除特定资源
     */
    disposeRes
}

const tobeDele: string[] = [];
/**
 * 删除资源
 * @param filter 
 */
function disposeRes(filter: { (res: IResource): boolean }) {
    let reses = _resources;
    let delLen = 0;
    for (let key in reses) {
        let res = reses[key];
        if (filter(res)) {
            tobeDele[delLen++] = key;
        }
    }
    for (let i = 0; i < delLen; i++) {
        let key = tobeDele[i];
        let res = reses[key];
        if (res) {
            res.dispose();
            Res.remove(res.uri);
            delete reses[key];
        }
    }
}


/**
 * 获取资源
 */
function getResource(resID: string): IResource {
    return _resources[resID];
}

/**
 * 注册资源
 */
function regResource(resID: string, res: IResource): boolean {
    var resources = _resources;
    if (resID in resources) {//资源id重复                
        return resources[resID] === res;
    }
    resources[resID] = res;
    return true;
}

function get<T extends IResource>(resid: string, noResHandler: { (...args: any[]): T }, thisObj?: any, ...args: any[]): T
function get<T extends IResource>(resid: string, noResHandler: { (...args: any[]): T }, thisObj?: any): T {
    let res = getResource(resid) as T;
    if (!res) {
        let args = [];
        for (let i = 3; i < arguments.length; i++) {
            args[i - 3] = arguments[i];
        }
        res = noResHandler.apply(thisObj, args);
        regResource(resid, res);
    }
    return res;
}