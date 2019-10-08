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