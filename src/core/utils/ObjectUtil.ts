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

/**
 * 获取指定属性的描述，会查找当前数据和原型数据
 * @param target    指定目标
 * @param property  指定的属性名字
 */
export function getPropertyDescriptor(target: any, property: string): PropertyDescriptor {
    let data = Object.getOwnPropertyDescriptor(target, property);
    if (data) {
        return data;
    }
    let prototype = Object.getPrototypeOf(target);
    if (prototype) {
        return getPropertyDescriptor(prototype, property);
    }
}