declare const enum RequestState {
    /**
     * 未请求/未加载 0
     */
    UnRequest = 0,
    /**
     * 请求中/加载中，未获得值 1
     */
    Requesting = 1,
    /**
     * 已加载/已获取到值 2
     */
    Complete = 2,
    /**
     * 加载失败 -1
     */
    Failed = -1
}