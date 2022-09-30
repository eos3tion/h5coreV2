/**
 * 对指定`属性名`创建getter属性 返回 this.cfg[属性名]
 * @param baseCfgKey 默认配置的名称
 * @param cfgProperty 
 * @param enumerable 
 * @param configurable 
 * @returns 
 */
export function d_getter(baseCfgKey = "cfg", cfgProperty?: string, enumerable = false, configurable = true) {
    return function (host: any, property: string) {
        bindBaseProperty(host, property, baseCfgKey, cfgProperty, enumerable, configurable);
    }
}

export function bindBaseProperty(host: any, property: string, baseCfgKey = "cfg", cfgProperty?: string, enumerable = false, configurable = true) {
    cfgProperty = cfgProperty || property;
    Object.defineProperty(host, property, {
        get() {
            let cfg: any = this[baseCfgKey];
            return cfg && cfg[cfgProperty];
        },
        enumerable,
        configurable
    })
}