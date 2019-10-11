import { ThrowError } from "../debug/ThrowError";


/**
 * 尝试将数据转成number类型，如果无法转换，用原始类型
 * 
 * @param {*} value 数据
 * @returns 
 */
function tryParseNumber(value: any) {
    if (typeof value === "boolean") {
        return value ? 1 : 0;
    }
    if (value == +value && value.length == (+value + "").length) { // 数值类型
        // "12132123414.12312312"==+"12132123414.12312312"
        // true
        // "12132123414.12312312".length==(+"12132123414.12312312"+"").length
        // false
        return +value;
    } else {
        return value;
    }
}

export function getData(valueList: any[], keyList: string[], o?: any): any {
    o = o || {};
    for (let i = 0, len = keyList.length; i < len; i++) {
        let key = keyList[i];
        let v = valueList[i];
        if (v != undefined) {
            o[key] = valueList[i];
        }
    }
    return o;
}

export function copyData<T>(to: T, valueList: any[], keyList: (keyof T)[]) {
    for (let i = 0, len = keyList.length; i < len; i++) {
        let key = keyList[i];
        to[key] = valueList[i];
    }
}

export function getZuobiao(data: number[]): Point {
    return { x: data[0], y: data[1] };
}

export function parseDatas(to: any, from: any, checkStart: number, checkEnd: number, dataKey: string, toDatasKey: string) {
    let arr: any[] = [];
    for (let i = checkStart, j = 0; i <= checkEnd; i++) {
        let key: string = dataKey + i;
        if (key in from) {
            arr[j++] = from[key];
        }
    }
    to[toDatasKey] = arr;
}
export function parseDatas2(to: any, valueList: any[], keyList: string[], checkStart: number, checkEnd: number, dataKey: string, toDatasKey: string) {
    let arr: any[] = [];
    for (let i = checkStart, j = 0; i <= checkEnd; i++) {
        let key: string = dataKey + i;
        let idx = keyList.indexOf(key);
        if (~idx) {
            arr[j++] = valueList[idx];
        }
    }
    to[toDatasKey] = arr;
}
export function getDataList(dataList: any[][], keyList: string[]): any[] {
    let list = [];
    if (dataList) {
        for (let i = 0, len = dataList.length; i < len; i++) {
            let valueList = dataList[i];
            list.push(getData(valueList, keyList));
        }
    }
    return list;
}
export function parseDataList(dataList: any[][], keyList: string[], forEach: { (t: any, args: any[], idx?: number): any }, thisObj: any, ...args: any[]) {
    if (dataList) {
        for (let i = 0, len = dataList.length; i < len; i++) {
            let valueList = dataList[i];
            let to = getData(valueList, keyList);
            forEach.call(thisObj, to, args, i);
        }
    }
}
export function copyDataList<T>(creator: { new(): T }, dataList: any[][], keyList: (keyof T)[], forEach: { (t: T, args: any[], idx?: number): any }, thisObj: any, ...args: any[]) {
    if (dataList) {
        for (let i = 0, len = dataList.length; i < len; i++) {
            let valueList = dataList[i];
            let to = new creator();
            copyData(to, valueList, keyList);
            forEach.call(thisObj, to, args, i);
        }
    }
}

export function parseXAttr2(from: any, xattr: any, keyPrefix = "pro", valuePrefix = "provalue", delOriginKey = true) {
    var xReg: RegExp = new RegExp("^" + keyPrefix + "(\\d+)$");
    if (DEBUG) {
        var repeatedErr: string = "";
    }
    var keyCount = 0;
    for (let key in from) {
        var obj = xReg.exec(key);
        if (obj) {
            var idx = +(obj[1]) || 0;
            var valueKey: string = valuePrefix + idx;
            if (DEBUG) {
                if (key in xattr) {
                    repeatedErr += key + " ";
                }
            }
            var value = +(from[valueKey]);
            if (value > 0) {//只有大于0做处理
                keyCount++;
                xattr[from[key]] = value;
            }
            if (delOriginKey) {
                delete from[key];
                delete from[valueKey];
            }
        }
    }
    if (DEBUG) {
        if (repeatedErr) {
            ThrowError("有重复的属性值:" + repeatedErr);
        }
    }
    return keyCount;
}
export function parseXAttr(from: any, xattr: any, delOriginKey = true, xReg = /^x\d+$/) {
    var keyCount = 0;
    for (let key in from) {
        if (xReg.test(key)) {
            var value = +(from[key]);
            if (value > 0) {//只有大于0做处理
                keyCount++;
                xattr[key] = value;
            }
            if (delOriginKey) {
                delete from[key];
            }
        }
    }
    return keyCount;
}
export function getZuobiaos(data: any[][], out?: Point[]) {
    out = out || [];
    for (let i = 0; i < data.length; i++) {
        out.push(getZuobiao(data[i]));
    }
}
export function getArray2D(value: any) {
    if (Array.isArray(value)) {
        return value;
    }
    if (value.trim() == "") {
        return;
    }
    let arr: any[] = value.split("|");
    arr.forEach((item, idx) => {
        let subArr: any[] = item.split(":");
        arr[idx] = subArr;
        subArr.forEach((sitem, idx) => {
            subArr[idx] = tryParseNumber(sitem);
        });
    })
    return arr;
}
export function getArray(value: string) {
    if (Array.isArray(value)) {
        return value;
    }
    value = value + "";
    if (value.trim() == "") {
        return;
    }
    let arr = value.split(/[:|]/g);
    arr.forEach((item, idx) => {
        arr[idx] = tryParseNumber(item);
    })
    return arr;
}