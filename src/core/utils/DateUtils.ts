import { zeroize, substitute } from "./StringUtils";

const { ceil } = Math;

/**
 * 时间处理函数
 * DateUtils
 */

export const _sharedDate = new Date();

/**
 * 获取运行时间  
 * 此时间为进程运行时间，不会随着调整系统时间而变动
 */
export const getTimer = typeof performance != "undefined" && performance.now && function () {
    return ceil(performance.now());
} || Date.now;

/**
 * 基于UTC的时间偏移
 */
let _utcOffset = -_sharedDate.getTimezoneOffset() * Time.ONE_MINUTE;//默认使用当前时区，防止一些报错

/**
 * 服务器UTC偏移后的基准时间
 */
let _serverUTCTime = _utcOffset;//默认使用本地时间

/**
 * 初始化服务器时间
 *
 * @param time 服务器时间戳
 * @param timezoneOffset 服务器基于UTC的时区偏移，单位`分钟`
 */
export function initServerTime(time: number, timezoneOffset: number) {
    _utcOffset = -timezoneOffset * Time.ONE_MINUTE;
    setServerTime(time);
}
/**
 * 设置服务器时间
 * 用于同步服务器时间
 * @param time
 */
export function setServerTime(time: number) {
    _serverUTCTime = time - getTimer() + _utcOffset;
}

/**
 * 获取当前时间戳，用于和服务端的时间戳进行比较
 */
export function getServerTime() {
    return getUTCServerTime() - _utcOffset;
}

/**
 * 通过UTC偏移过的当前时间戳
 */
export function getUTCServerTime() {
    return _serverUTCTime + getTimer();
}

/**
 * 通过UTC偏移过的Date
 */
export function getUTCServerDate() {
    _sharedDate.setTime(getUTCServerTime());
    return _sharedDate;
}

/**
 * 格式化时间
 * @param date 
 * @param format 时间字符串，如`yyyy-MM-dd HH:mm:ss`
 * @param isUTC 是本地时间，还是`utc`时间
 */
export function formatDate(date: Date, format: string, isUTC?: boolean) {
    return format.replace(/"[^"]*"|'[^']*'|(?:d{1,2}|m{1,2}|yy(?:yy)?|([hHMs])\1?)/g, function ($0) {
        switch ($0) {
            case "d": return gd(date, isUTC) + "";
            case "dd": return zeroize(gd(date, isUTC), 2);
            case "M": return gM(date, isUTC) + 1 + "";
            case "MM": return zeroize(gM(date, isUTC) + 1, 2);
            case "yy": return (gy(date, isUTC) + "").substr(2);
            case "yyyy": return gy(date, isUTC) + "";
            case "h": return (gH(date, isUTC) % 12 || 12) + "";
            case "hh": return zeroize(gH(date, isUTC) % 12 || 12, 2);
            case "H": return gH(date, isUTC) + "";
            case "HH": return zeroize(gH(date, isUTC), 2);
            case "m": return gm(date, isUTC) + "";
            case "mm": return zeroize(gm(date, isUTC), 2);
            case "s": return gs(date, isUTC) + "";
            case "ss": return zeroize(gs(date, isUTC), 2);
            default: return $0.substr(1, $0.length - 2);
        }
    });

    function gd(d: Date, isUTC: boolean) { return isUTC ? d.getUTCDate() : d.getDate() }
    function gM(d: Date, isUTC: boolean) { return isUTC ? d.getUTCMonth() : d.getMonth() }
    function gy(d: Date, isUTC: boolean) { return isUTC ? d.getUTCFullYear() : d.getFullYear() }
    function gH(d: Date, isUTC: boolean) { return isUTC ? d.getUTCHours() : d.getHours() }
    function gm(d: Date, isUTC: boolean) { return isUTC ? d.getUTCMinutes() : d.getMinutes() }
    function gs(d: Date, isUTC: boolean) { return isUTC ? d.getUTCSeconds() : d.getSeconds() }
}

/**
 * 将服务器有偏移量的时间戳，转换成显示时间相同的UTC时间戳，用于做显示
 * 
 * @static
 * @param time 正常的时间戳
 * @returns UTC偏移后的时间戳
 */
export function getUTCTime(time: number) {
    return time + _utcOffset;
}

export function formatTime(time: number, format: string, isUTC?: boolean) {
    if (isUTC) {
        time = getUTCTime(time);
    }
    _sharedDate.setTime(time);
    return formatDate(_sharedDate, format);
}

/**
 * 获取指定时间的当天结束(23:59:59'999)时间戳
 *
 * @static
 * @param time 指定的时间，不设置时间，则取当前服务器时间
 * @returns 指定时间的当天结束(23:59:59'999)时间戳
 */
export function getDayEnd(time?: number) {
    if (time === undefined) time = getServerTime();
    _sharedDate.setTime(time);
    return _sharedDate.setHours(23, 59, 59, 999);
}

/**
 * 获取指定时间的当天结束(23:59:59'999)UTC强制偏移时间戳
 *
 * @static
 * @param time 指定的utc偏移后的时间，不设置时间，则取当前服务器时间
 * @returns 指定时间的当天结束(23:59:59'999)时间戳
 */
export function getUTCDayEnd(utcTime?: number) {
    if (utcTime === undefined) utcTime = getUTCServerTime();
    _sharedDate.setTime(utcTime);
    return _sharedDate.setUTCHours(23, 59, 59, 999);
}
/**
 * 获取指定时间的当天开始的(0:0:0'0)时间戳
 *
 * @param time 指定的时间，不设置时间，则取当前服务器时间
 * @returns 指定时间的当天开始的(0:0:0'0)时间戳
 */
export function getDayStart(time?: number) {
    if (time === undefined) time = getServerTime();
    _sharedDate.setTime(time);
    return _sharedDate.setHours(0, 0, 0, 0);
}
/**
 * 获取指定时间的当天开始的(0:0:0'0)UTC强制偏移时间戳
 *
 * @param time 指定的UTC强制偏移时间，不设置时间，则取当前服务器时间
 * @returns 指定时间的当天开始的(0:0:0'0)时间戳
 */
export function getUTCDayStart(utcTime?: number) {
    if (utcTime === undefined) utcTime = getUTCServerTime();
    _sharedDate.setTime(utcTime);
    return _sharedDate.setUTCHours(0, 0, 0, 0);
}

/**
 * 获取天数  
 * 如要获取开服天数  
 * 1月1日 `23点50分`开服  
 * 1月2日 `6点0分`，则算开服`第二天`
 * @param startTime 起点时间戳
 * @param endTime 结束时间戳，不设置则取当天结束时间(23:59:59:999)
 */
export function getDayCount(startTime: number, endTime?: number) {
    endTime = getDayStart(endTime);
    return ceil((endTime - startTime) / Time.ONE_DAY) + 1;
}

/**
 * 获取天数，基于UTC时间计算 
 * 如要获取开服天数  
 * 1月1日 `23点50分`开服  
 * 1月2日 `6点0分`，则算开服`第二天`
 * @param startTime 起点时间戳
 * @param endTime 结束时间戳，不设置则取当天结束时间(23:59:59:999)
 */
export function getUTCDayCount(startTime: number, endTime?: number) {
    endTime = getUTCDayStart(endTime);
    return ceil((endTime - startTime) / Time.ONE_DAY) + 1;
}

/**
 * 倒计时的格式选项
 * 
 * @export
 * @interface CountDownFormatOption
 */
export interface CountDownFormatOption {
    /**
     * 
     * 剩余天数的修饰字符串  
     * 如： `{0}天`
     */
    d?: string,
    /**
     * 剩余小时的修饰字符串  
     * 如：`{0}小时`
     * 
     */
    h?: string,
    /**
     * 剩余分钟的修饰字符串  
     * 如：`{0}分钟`
     * 
     */
    m?: string,
    /**
     * 剩余秒数的修饰字符串  
     * 如：`{0}秒`
     * 
     */
    s?: string;

    /**
     * 小时补0
     */
    hh?: boolean;

    /**
     * 分钟补0
     */
    mm?: boolean;

    /**
     * 秒补0
     */
    ss?: boolean;
}

/**
 * 显示倒计时
 * 
 * @static
 * @param leftTime 剩余时间
 * @param  format 倒计时修饰符，
 * format 示例：{d:"{0}天",h:"{0}小时",m:"{0}分",s:"{0}秒"}
 */
export function getCountdown(leftTime: number, format: CountDownFormatOption) {
    let out = "";
    let tmp = format.d;
    if (tmp) {// 需要显示天
        let day = leftTime / Time.ONE_DAY >> 0;
        leftTime = leftTime - day * Time.ONE_DAY;
        out += substitute(tmp, day);
    }
    tmp = format.h;
    if (tmp) {// 需要显示小时
        let hour: any = leftTime / Time.ONE_HOUR >> 0;
        leftTime = leftTime - hour * Time.ONE_HOUR;
        if (format.hh) {
            hour = zeroize(hour, 2);
        }
        out += substitute(tmp, hour);
    }
    tmp = format.m;
    if (tmp) {// 需要显示分钟
        let minute: any = leftTime / Time.ONE_MINUTE >> 0;
        leftTime = leftTime - minute * Time.ONE_MINUTE;
        if (format.mm) {
            minute = zeroize(minute, 2);
        }
        out += substitute(tmp, minute);
    }
    tmp = format.s;
    if (tmp) {
        let second: any = leftTime / Time.ONE_SECOND >> 0;
        if (format.ss) {
            second = zeroize(second, 2);
        }
        out += substitute(tmp, second);
    }
    return out;
}