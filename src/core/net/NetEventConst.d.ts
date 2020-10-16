declare const enum EventConst {
    /**
     * 指令被限制
     */
    NetServiceSendLimit = -1899,
    /**
     * 需要显示重连
     */
    ShowReconnect,
    /**
     * 断网
     */
    Offline,
    /**
     * 连网成功
     */
    Online,
    /**
     * 服务器连接成功
     */
    Connected,
    /**
     * 远程服务器连接失败
     */
    ConnectFailed,
    /**
     * 和远程服务器断开连接
     */
    Disconnect,
}