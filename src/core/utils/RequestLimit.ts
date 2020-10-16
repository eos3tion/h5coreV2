import { getTimer } from "./DateUtils";

const _dic = {} as { [index: string]: number };


/**
 * 
 * 
 * @param key 锁定的对像(可以是任何类型,它会被当做一个key)
 * @param time 默认`500` 锁定对像 毫秒数
 * @returns 是否已解锁 true为没有被限制,false 被限制了
 */
export function checkLimit(key: Key, time = 500) {
    time = time | 0;
    if (time <= 0) {
        return true;
    }
    let t = _dic[key];
    let now = getTimer();
    if (t === undefined) {
        _dic[key] = time + now;
        return true;
    }
    let i = t - now;
    if (i > 0) {
        return false;
    }
    _dic[key] = time + now;
    return true;
}

/**
 * 删除限制 
 * @param key
 *
 */
export function removeLimit(key: Key) {
    _dic[key] = undefined;
}

