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


/**
 * 获取完整的 PropertyDescriptor
 * @param descriptor 
 * @param enumerable 
 * @param writable 
 * @param configurable 
 */
export function getDescriptor(descriptor: PropertyDescriptor, enumerable = false, writable = true, configurable = true) {
    if (!descriptor.set && !descriptor.get) {
        descriptor.writable = writable;
    }
    descriptor.configurable = configurable;
    descriptor.enumerable = enumerable;
    return descriptor;
}

export function getDescriptorMap(descriptors: { [key: string]: PropertyDescriptor }, enumerable = false, writable = true, configurable = true) {
    for (let key in descriptors) {
        let desc: PropertyDescriptor = descriptors[key];
        let enumer = desc.enumerable == undefined ? enumerable : desc.enumerable;
        let write = desc.writable == undefined ? writable : desc.writable;
        let config = desc.configurable == undefined ? configurable : desc.configurable;
        descriptors[key] = getDescriptor(desc, enumer, write, config);
    }
    return descriptors as PropertyDescriptorMap;
}