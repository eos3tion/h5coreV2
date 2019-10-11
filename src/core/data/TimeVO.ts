import { zeroize } from "../utils/StringUtils";
import { ThrowError } from "../debug/ThrowError";
import { getUTCDayStart, getDayStart } from "../utils/DateUtils";

/**
  * 解析数据
  * 
  * @private
  * @param {number} hour 
  * @param {number} minute
  * @returns 
  */
function _decode(_this: TimeVO, hour: number, minute: number) {
    _this.hour = hour;
    _this.minute = minute;
    _this.time = hour * Time.ONE_HOUR + minute * Time.ONE_MINUTE;
    _this.strTime = zeroize(hour, 2) + ":" + zeroize(minute, 2);
    return _this;
}
/**
 * TimveVO
 */
export class TimeVO {
    /**
     * 配置的小时
     */
    hour: number;
    /**
     * 配置的分钟
     */
    minute: number;

    /**
     * 小时和分钟的时间偏移
     */
    time: number;
    /**
     * 日期原始字符串
     */
    strTime: string;

    constructor(timeStr?: string) {
        if (timeStr) {
            this.decode(timeStr);
        }
    }

    /**
     * 从分钟进行解析
     * 
     * @param minutes 分钟数
     */
    decodeMinutes(minutes: number) {
        return _decode(this, minutes / 60 | 0, minutes % 60);
    }

    /**
     * 从一个数值进行序列化
     * decodeMinutes和decodeBit，如果使用protobuf writeVarint32 存储，时间只要超过 02:08，不管如何使用何种方式，一定会超过2字节，而 23:59，不管怎么存储，都不会超过2字节 
     * decodeBit解析比 decodeMinutes更加快捷
     * 而 hour<<6|minute  解析会更简单，快速
     * @param value 
     */
    decodeBit(value: number) {
        return _decode(this, value >> 6, value & 63);
    }


    /**
     * 从字符串中解析
     * 
     * @param strTime 通过解析器解析的数据
     */
    decode(strTime: string) {
        const timeArr = strTime.split(":");
        if (timeArr.length >= 2) {
            return _decode(this, +timeArr[0], +timeArr[1]);
        } else {
            DEBUG && ThrowError("时间格式不正确，不为HH:mm格式，当前配置：" + strTime);
        }
    }

    /**
    * 获取今日的服务器时间
    */
    get todayTime() {
        return this.getDayTime();
    }


    /**
     * 获取指定时间戳那天的时间
     * 
     * @param day 
     * @param isUTC 
     * @returns 获取指定时间戳那天的时间
     */
    getDayTime(day?: number, isUTC?: boolean) {
        const dayStart = isUTC ? getUTCDayStart : getDayStart;
        return dayStart(day) + this.time;
    }

}