import { ThrowError } from "../debug/ThrowError";

const _zeros = "000000000000000000000000000000000000000000000000000000000000";
const zeroLen = _zeros.length;

/**
 * 对数字进行补0操作
 * @param value 要补0的数值
 * @param length 要补的总长度
 * @return 补0之后的字符串
 */
export function zeroize(value: string | number, length: number) {
    let str = "" + value;
    let zeros: string;
    let len = length - str.length;
    if (len > 0) {
        if (length < zeroLen) {
            zeros = _zeros.slice(0, len);
        } else {
            zeros = "";
            for (let i = 0; i < len; i++) {
                zeros += "0";
            }
        }
        return zeros + str;
    } else {
        return str;
    }
}


const subHandler: { [index: string]: { (input: any): string } } = {};

export function regSubHandler(key: string, handler: { (input: any): string }) {
    if (DEBUG) {
        if (handler.length != 1) {
            ThrowError(`String.regSubHandler注册的函数，参数数量必须为一个，堆栈：\n${new Error().stack}\n函数内容：${handler.toString()}`);
        }
        if (key in subHandler) {
            ThrowError(`String.regSubHandler注册的函数，注册了重复的key[${key}]，堆栈：\n${new Error().stack}`);
        }
    }
    subHandler[key] = handler;
}
export function substitute(value: string, ...args: any[]) {
    let len = args.length;
    if (len > 0) {
        let obj: any;
        if (len == 1) {
            obj = args[0];
            if (typeof obj !== "object") {
                obj = args;
            }
        } else {
            obj = args;
        }
        if ((obj instanceof Object) && !(obj instanceof RegExp)) {
            return value.replace(/\{(?:%([^{}]+)%)?([^{}]+)\}/g, function (match: string, handler: string, key: string) {
                //检查key中，是否为%开头，如果是，则尝试按方法处理                        
                let value = obj[key];
                if (handler) {//如果有处理器，拆分处理器
                    let func = subHandler[handler];
                    if (func) {
                        value = func(value);
                    }
                }
                return (value !== undefined) ? '' + value : match;
            });
        }
    }
    return value.toString();//防止生成String对象，ios反射String对象会当成一个NSDictionary处理
}

/**
 * DJBHash算法  
 * 俗称"Times33"算法  
 * @param str 
 */
export function djbHash(str: string) {
    let len = str.length;
    let hash = 5381;
    for (var i = 0; i < len; i++) {
        hash += (hash << 5) + str.charCodeAt(i);
    }
    return hash & 0xffffffff;
}