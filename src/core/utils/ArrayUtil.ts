import { ThrowError } from "../debug/ThrowError";

export function appendTo<T>(from: T[], to: T[]) {
    let len = from.length;
    for (let i = 0; i < len; i++) {
        to.push(from[i]);
    }
}

export function pushOnce<T>(list: T[], t: T) {
    let idx = list.indexOf(t);
    if (!~idx) {
        idx = list.length;
        list[idx] = t;
    }
    return idx;
}

/**
 * 从列表中移除一个元素
 * @param list 
 * @param t 
 * @returns true 说明列表中有这个元素，false 说明列表中没有这个元素
 */
export function removeFrom<T>(list: T[], t: T) {
    let idx = list.indexOf(t);
    if (~idx) {
        list.splice(idx, 1);
        return true;
    }
    return false;
}

/**
 * 从列表中，随机选取一个数据
 * @param list 
 */
export function getRandom<T>(list: T[], random = Math.random) {
    return list[list.length * random() | 0]
}

/**
 * 检查数组中的每个数据是否完全相同，使用`===`的方式进行检查
 * 
 * @param list 
 */
export function arrayValuesAreEqual<T>(list: T[]) {
    for (let i = 0; i < list.length - 1; i++) {
        if (list[i] !== list[i + 1]) {
            return false;
        }
    }
    return true;
}

export function doSort(array: any[], key?: string, descend?: boolean) {
    if (key) {
        return array.sort((a: any, b: any) => descend ? b[key] - a[key] : a[key] - b[key]);
    } else {
        return array.sort((a: any, b: any) => descend ? b - a : a - b);
    }
}

const sortDefault: { [type: string]: any } = Object.freeze({
    number: 0,
    string: "",
    boolean: false
})
export function multiSort<T>(array: T[], kArr: (keyof T)[], dArr?: boolean[] | boolean) {
    let isArr = Array.isArray(dArr);
    return array.sort((a: T, b: T): number => {
        for (let idx = 0, len = kArr.length; idx < len; idx++) {
            let key = kArr[idx];
            let mode = isArr ? !!(dArr as boolean[])[idx] : !!dArr;
            let av = a[key];
            let bv = b[key];
            let typea = typeof av;
            let typeb = typeof bv;
            if (typea == "object" || typeb == "object") {
                if (DEBUG) {
                    ThrowError(`multiSort 比较的类型不应为object,${typea}    ${typeb}`);
                }
                return 0;
            }
            else if (typea != typeb) {
                if (typea === "undefined" && typeb !== "undefined") {
                    av = sortDefault[typeb];
                } else if (typeb == "undefined" && typea !== "undefined") {
                    bv = sortDefault[typea];
                } else {
                    if (DEBUG) {
                        ThrowError(`multiSort 比较的类型不一致,${typea}    ${typeb}`);
                    }
                    return 0;
                }
            }
            if (av < bv) {
                return mode ? 1 : -1;
            } else if (av > bv) {
                return mode ? -1 : 1;
            } else {
                continue;
            }
        }
        return 0;
    });
}