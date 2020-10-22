
declare const enum PBType {
    Double = 1,
    Float,
    Int64,
    UInt64,
    Int32,
    Fixed64,
    Fixed32,
    Bool,
    String,
    Group,
    Message,
    Bytes,
    Uint32,
    Enum,
    SFixed32,
    SFixed64,
    SInt32,
    SInt64
}

/**
 * protobuf2 的字段类型
 * 
 * @export
 * @enum {number}
 */
declare const enum PBFieldType {
    Optional = 1,
    Required,
    Repeated
}

/**
 * 单个Field的结构
 * 
 * @interface PBField
 */
interface PBField extends Array<any> {
    /**
     * 
     * 必有 属性名字
     * @type {Key}
     */
    0: Key;
    /**
     * 
     * 必有 required optional repeated
     * @type {PBFieldType}
     */
    1: PBFieldType;
    /**
     * 
     * 必有 数据类型
     * @type {number}
     */
    2: number;
    /**
     * 
     * 可选 消息类型名称
     * @type {(Key | PBStruct)}
     * @memberOf PBField
     */
    3?: Key | PBStruct;
    /**
     * 可选 默认值
     * 
     * @type {*}
     */
    4?: any;
}

/**
 * 单条消息的定义
 * 
 * @interface PBStruct
 */
interface PBStruct {
    /**索引 */
    [index: number]: PBField;
    /**
     * 有默认值的key
     * 
     * @type {any}
     * @memberOf PBStruct
     */
    def?: any;

    ref?: { new(): any, prototype: any };
}


interface PBStructDictInput {
    /**
     * 是否初始化过
     * 
     * @type {*}
     * @memberOf PBStructDict
     */
    $$inted?: any;
    [index: string]: PBStruct | Key;
}

declare type ByteArray = import("../data/ByteArray").ByteArray;