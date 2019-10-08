const random = Math.random;

/**
 * 让数值处于指定的最大值和最小值之间，低于最小值取最小值，高于最大值取最大值
 * @param value 要处理的数值
 * @param min   最小值
 * @param max   最大值
 */
export function clamp(value: number, min: number, max: number) {
    if (min > max) {
        let tmp = min;
        min = max;
        max = tmp;
    }
    if (value < min) {
        value = min;
    } else if (value > max) {
        value = max;
    }
    return value;
}

/**
 * 从最小值到最大值之间随机[min,max)
 * @param min 
 * @param max 
 */
export function random2(min: number, max: number) {
    return min + random() * (max - min);
}

/**
 * 从中间值的正负差值 之间随机 [center-delta,center+delta) 
 * 
 * @param center 中间值
 * @param delta 差值
 */
export function random3(center: number, delta: number) {
    return center - delta + random() * 2 * delta;
}

/**
 * 从终结者的正负差值(spread)之间随机  
 * @param center 
 * @param spread 最大值-最小值
 */
export function random4(center: number, spread: number) {
    return random3(center, spread * .5);
}