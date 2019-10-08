/**
 * 浅克隆  
 * 不判断属性是否为自己的，会拷贝原型中的数据
 * @param from 
 */
export function clone<T>(from: T) {
    let output = {} as Partial<T>;
    for (let n in from) {
        output[n] = from[n];
    }
    return output;
}