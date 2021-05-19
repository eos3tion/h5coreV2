
interface $NSFilter {
    /**
     * 感兴趣的请求
     * 
     * @type { [index: number]: boolean }
     * @memberOf $gmNSLog
     */
    cmds?: number[];
    /**
     * 是否为白名单模式，默认黑名单
     * 
     * @type {boolean}
     * @memberOf $NSFilter
     */
    isWhite: boolean;

    /**
     * 过滤器
     * 
     * @type {{ ($gmNSLog, ...args): boolean }}
     * @memberOf $NSFilter
     */
    filter?: { ($gmNSLog: any, ...args: any[]): boolean };

    /**
     * 过滤器参数
     * 
     * @type {any[]}
     * @memberOf $NSFilter
     */
    filterParams?: any[];
}
interface $NSLog {
    time: number;
    type: "send" | "receive";
    cmd: number;
    data: any;
    json: string;
}
/**
 * 用于扩展GM指令
 * 
 * @interface $gmType
 */
interface $gmType {

    /**
     * 发送的网络消息的日志
     * 
     */
    printSendFilter: $NSFilter;

    /**
     * 接收的网络消息的日志
     * 
     */
    printReceiveFilter: $NSFilter;

    /**
     * 日志数据
     */
    nsLogs: $NSLog[];

    /**
     * 输出日志内容
     */
    showNSLog(): $NSLog[];
    showNSLog(filter: { ($gmNSLog: $NSLog, ...args: any[]): boolean }, ...args: any[]): $NSLog[];
    showNSLog(isWhite: boolean, ...cmds: number[]): $NSLog[];
    /**
     * 使用黑名单模式，进行输出
     * 
     * @param cmds
     * 
     */
    showNSLog(...cmds: number[]): $NSLog[];

    /**
     * 最大网络日志数量
     * 
     */
    maxNSLogCount: number;

    /**
     * 控制台输出发送日志
     */
    printSend(): void;
    /**
     * 使用过滤函数过滤在控制台输出的发送日志
     * 
     * @param {{ ($gmNSLog, ...args): boolean }} filter     过滤函数，函数返回true的会显示在控制台上
     * @param {any} args                                    过滤函数使用的参数
     */
    printSend(filter: { ($gmNSLog: $NSLog, ...args: any[]): boolean }, ...args: any[]): void;
    /**
     * 显示或排除指定指令的发送日志，并在控制台输出
     * 
     * @param isWhite       是否为白名单模式
     * @param cmds          指令列表
     */
    printSend(isWhite: boolean, ...cmds: number[]): void;
    /**
     * 排除指定指令的发送日志，将其他日志信息在控制台输出
     * 
     * @param cmds    黑名单列表
     */
    printSend(...cmds: number[]): void;

    /**
     * 控制台输出接收日志
     */
    printReceive(): void;
    /**
     * 使用过滤函数过滤并在控制台输出接收日志
     * 
     * @param filter     过滤函数，函数返回true的会显示在控制台上
     * @param args       过滤函数使用的参数
     */
    printReceive(filter: { ($gmNSLog: $NSLog, ...args: any[]): boolean }, ...args: any[]): void;
    /**
     * 显示或排除指定指令的接收日志，并在控制台输出
     * 
     * @param isWhite       是否为白名单模式
     * @param cmds          指令列表
     */
    printReceive(isWhite: boolean, ...cmds: number[]): void;
    /**
     * 排除指定指令的接收日志，将其他日志信息在控制台输出
     * 
     * @param cmds
     * 
     */
    printReceive(...cmds: number[]): void;

    /**
     * 调用printSend和printReceive的一个简写
     * 
     */
    print(): void;

    /**
     * 模拟服务端发送数据
     * 
     * @param {number} cmd 
     * @param {*} [data] 
     * 
     * @memberof $gmType
     */
    route(cmd: number, data?: any): void;

    /**
     * 使用日志数据进行模拟调试
     * 
     * @param {$NSLog[]} logs 
     * 
     * @memberof $gmType
     */
    batchRoute(logs: $NSLog[]): void;

    /**
     * 获取网络传输数据日志的过滤器
     * @returns {$NSFilter}
     * 
     * @memberOf $gmType
     */
    __getNSFilter(...args: any[]): $NSFilter;

    /**
     * 检查是否需要显示日志
     * 
     * @param {$NSLog} log
     * @param {$NSFilter} nsFilter
     * @returns {boolean}
     * 
     * @memberOf $gmType
     */
    __nsLogCheck(log: $NSLog, nsFilter: $NSFilter): boolean;

    /**
     * 调试用，如果开启后，所有send指令时，按此值额外将同一数据发送多次，加上本身的一次，一共发送`multiSend+1`次
     */
    multiSend: number;
}