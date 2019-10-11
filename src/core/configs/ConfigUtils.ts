import { ResItem } from "../res/Res";
import { djbHash } from "../utils/StringUtils";
import { ThrowError } from "../debug/ThrowError";
import { dispatch } from "../../three/App";

export interface Path {
    /**
     * 路径
     * 
     * @type {string}
     * @memberOf Path
     */
    path: string,

    /**
     * 处理后的路径
     * 
     * @type {string}
     * @memberOf Path
     */
    tPath: string,
    /**
     * 是否忽略前缀
     * 
     * @type {boolean}
     * @memberOf Path
     */
    iPrefix?: boolean,
    /**
     * 父路径的标识
     * 
     * @type {string}
     * @memberOf Path
     */
    parent?: string;

}

export interface JConfig {

    /**
     * 替换用参数
     */
    replacer?: { [replacer: string]: string };
    /**
     * 参数字典  
     * key      {string}    标识
     * value    {any}       对应数据
     * 
     */
    params?: { [key: string]: any };
    /**
     * 前缀字典
     * 
     */
    prefixes: string[];
    /**
     * 路径信息的字典
     */
    paths: PathMap;

    preload?: ResItem[];
}

/**
 * 路径信息
 */
interface PathMap {
    res: Path;
    skin: Path;

    [indes: string]: Path;
}



/**
 * 资源的 版本字典
 */
let _hash: { [hash: string]: number } = {};



/**
 * 配置数据
 */
let _data: JConfig;

/**
 * 注册的皮肤路径  
 * key      皮肤的key
 * value    皮肤实际路径地址
 */
let _regedSkinPath = {} as { [index: string]: Path };
let getPrefix: { (uri: string): string };

let _res: Path;

/**
 * 获取皮肤路径
 * 
 * @param {string} key 
 * @param {string} fileName 
 * @returns 
 */
function getSkinPath(key: string, fileName: string) {
    return key + "/" + fileName;
}

/**
 * 通过Path获取完整url
 * 
 * @private
 * @static
 * @param {string} uri 路径标识
 * @param {Path} path Path对象
 * @returns
 */
function getUrlWithPath(uri: string, path: Path) {
    if (!path || /^((http|https):)?\/\//.test(uri)) {//如果是http://或者https://，或者//开头，即为完整地址，不加前缀
        return uri;
    }
    uri = path.tPath + uri;
    let prefix = path.iPrefix ? "" : getPrefix(uri);
    return prefix + uri;
}

/**
 * 根据uri缓存url的字典
 */
const uriDict: { [index: string]: string } = {};


/**
 * 获取资源版本号
 * @param uri 
 */
function getResVer(uri: string) {
    return ~~(uri && _hash && _hash[djbHash(uri)]);
}
function tryReplace(v: any, replacer: { [index: string]: string }) {
    if (replacer) {
        if (typeof v === "string") {
            return doReplace(v, replacer);
        } else if (typeof v === "object") {
            for (let k in v) {
                v[k] = tryReplace(v[k], replacer);
            }
        }
    }
    return v;
}
function doReplace(value: string, replacer: { [index: string]: string }) {
    return value.replace(/[$][{]([^{}]+)[}]/g, (match, subkey) => {
        let value = replacer[subkey];
        return value !== undefined ? "" + value : match;
    });
}
/**
 * 配置工具
 * @author 3tion
 * @export
 * @class ConfigUtils
 */
export const ConfigUtils = {
    replace(data: JConfig) {
        let replacer = data.replacer;
        if (replacer) {
            Object.keys(data).forEach(key => {
                if (key != "replacer") {
                    let v = data[key as keyof JConfig];
                    data[key as keyof JConfig] = tryReplace(v, replacer);
                }
            })
        }
        return data;
    },
    setData(data: JConfig) {
        _data = data;
        !_data.params && (_data.params = {})
        //检查路径是否存在有路径有父路径的，如果有，进行预处理
        let paths = _data.paths;
        for (let key in paths) {
            let p = paths[key];
            p.tPath = getPath(p, paths);
        }
        _res = _data.paths.res;
        //检查前缀
        getPrefix = (function (prefixes: string[]) {
            let len = 0;
            if (prefixes) {
                len = prefixes.length;
            }
            switch (len) {
                case 0:
                    return () => "";
                case 1: {
                    let prefix = prefixes[0];
                    return () => prefix;
                }
                default:
                    return (uri: string) => {
                        let idx = djbHash(uri) % len;
                        return prefixes[idx] || "";
                    }
            }
        })(_data.prefixes)

        function getPath(p: Path, paths: PathMap): string {
            let parentKey = p.parent;
            if (parentKey) {
                let parent = paths[parentKey];
                if (parent) {
                    return getPath(parent, paths) + p.path;
                } else if (DEBUG) {
                    ThrowError(`路径[${p.path}]配置了父级(parent)，但是找不到对应的父级`);
                }
            }
            return p.path;
        }
    },
    /**
     * 解析版本控制文件
     * @param {ArrayBufferLike} hash 
     */
    parseHash(hash: ArrayBufferLike) {
        let dv = new DataView(hash);
        let pos = 0;
        let len = dv.byteLength;
        _hash = {};
        while (pos < len) {
            let hash = dv.getUint32(pos);
            pos += 4;
            let version = dv.getUint16(pos);
            pos += 2;
            _hash[hash] = version;
        }
        dispatch(EventConst.ParseResHash);
    },
    /**
     * 设置版本控制文件
     * @param hash 
     */
    setHash(hash: { [index: string]: number }) {
        _hash = hash;
    },
    getResVer,

    /**
     * 获取资源完整路径
     * 
     * @static
     * @param {string} uri                  路径标识
     * @returns {string}
     */
    getResUrl(uri: string): string {
        if (uri) {
            let url = uriDict[uri];
            if (!url) {
                let ver = getResVer(uri);
                if (ver) {
                    if (uri.indexOf("?") == -1) {
                        uri = uri + "?" + ver;
                    }
                    else {
                        uri = uri + "&jyver=" + ver;
                    }
                }
                url = getUrlWithPath(uri, _res);
                uriDict[uri] = url;
            }
            if (DEBUG) {
                if (url.search(/(undefined|null)/) > -1) {
                    ThrowError(`url[${url}]中出现了${RegExp.$1}这样的字符，请检查`);
                }
            }
            return url;
        } else if (DEBUG) {
            ThrowError(`设置了空的uri`);
        }
    },
    /**
     * 获取参数
     */
    getParam(key: string): any {
        return _data.params[key];
    },
    getSkinPath,
    /**
     * 获取皮肤文件地址
     */
    getSkinFile(key: string, fileName: string) {
        return getUrlWithPath(getSkinPath(key, fileName), _regedSkinPath[key] || _data.paths.skin);
    },
    /**
     * 设置皮肤路径
     * 如 `lib` 原本应该放在当前项目  resource/skin/ 目录下  
     * 现在要将`lib`的指向改到  a/ 目录下  
     * 则使用下列代码
     * ```typescript
     * ConfigUtils.regSkinPath("lib","a/");
     * ```
     * 如果要将`lib`的指向改到 http://www.xxx.com/a/下  
     * 则使用下列代码
     * ```typescript
     * ConfigUtils.regSkinPath("lib","http://www.xxx.com/a/",true);
     * ```
     * 如果域名不同，`自行做好跨域策略CROS`
     * 
     * @param {string} key 
     * @param {string} path 
     * @param {boolean} [iPrefix] 是否忽略皮肤前缀
     */
    regSkinPath(key: string, path: string, iPrefix?: boolean) {
        _regedSkinPath[key] = { tPath: path, path, iPrefix };
    },
    /**
     * 获取路径
     * 
     * @param {string} uri 
     * @param {string} pathKey 
     * @returns 
     */
    getUrl(uri: string, pathKey: string) {
        let path = _data.paths[pathKey];
        if (path) {
            return getUrlWithPath(uri, path);
        }
    }
}