/**
 * 使用微软vs code中使用的代码  
 * 用于一些 lazy 的调用
 * https://github.com/Microsoft/vscode/blob/master/src/vs/base/common/decorators.ts
 * 
 * @export
 * @param {*} target 
 * @param {string} key 
 * @param {*} descriptor 
 */
export function d_memoize(target: any, key: string, descriptor: any) {
    let fnKey: string = null;
    let fn: Function = null;

    if (typeof descriptor.value === 'function') {
        fnKey = 'value';
        fn = descriptor.value;
    } else if (typeof descriptor.get === 'function') {
        fnKey = 'get';
        fn = descriptor.get;
    }

    if (!fn) {
        throw new Error('not supported');
    }

    const memoizeKey = `$memoize$${key}`;

    descriptor[fnKey] = function (...args: any[]) {
        if (!this.hasOwnProperty(memoizeKey)) {
            Object.defineProperty(this, memoizeKey, {
                configurable: false,
                enumerable: false,
                writable: false,
                value: fn.apply(this, args)
            });
        }
        return this[memoizeKey];
    };
}