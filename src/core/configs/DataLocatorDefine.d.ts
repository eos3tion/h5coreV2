/**
 * 配置的`主数据` 
 */
interface CfgData {
    [key: string]: any
}
/**
 * 配置的`附加数据`
 * 
 */
interface ExtraData {
    [key: string]: any
}

declare var $DD: CfgData;

declare var $DE: ExtraData;