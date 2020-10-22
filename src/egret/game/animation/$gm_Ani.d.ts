interface $gmType {
    /**
     * 记录Ani数据
     * 
     * 
     * @memberOf $gmType
     */
    recordAni(): void;
    /**
     * 是否记录Ani数据
     * 
     * @type {boolean}
     * @memberOf $gmType
     */
    _recordAni: boolean;

    /**
     * ani记录
     * 
     * @type {{ [index: number]: $gmAniInfo }}
     * @memberOf $gmType
     */
    _aniRecords: { [index: number]: $gmAniInfo };

    /**
     * 显示aniRender的记录信息
     * 
     * @param {number} time 超过多少时间的进行显示，默认值为0
     * 
     * @memberOf $gmType
     */
    showAniRecords(time?: number): void;

    /**
     * 显示残留的aniRender的堆栈信息
     * 
     * @param {number} [time]
     * 
     * @memberOf $gmType
     */
    showAniStacks(time?: number): void;
}
interface $gmAniInfo {
    /**
     * ani标识
     * 
     * @type {number}
     * @memberOf $gmAniInfo
     */
    guid: number;
    /**
     * 堆栈信息
     * 
     * @type {string}
     * @memberOf $gmAniInfo
     */
    stack: string;
    /**
     * 启动时间
     * 
     * @type {number}
     * @memberOf $gmAniInfo
     */
    time: number;
}