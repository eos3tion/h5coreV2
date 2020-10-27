/**
 * mvc使用的事件区段
 * -999~ -500
 * 
 * @export
 * @enum {number}
 */
declare const enum EventConst {
    /**
     * 通知角标变更  
     * data {BadgeInfo}
     */
    Notification = -999,
    /**
     * 模块检查器初始化完毕
     */
    ModuleCheckerInited,
    /**
     * 尝试调用某个功能<br/>
     * data 为功能ID
     */
    ModuleTryToggle,

    /**
    * 有功能，服务端要求临时关闭<br/>
    * data 为功能ID
    */
    ModuleServerClose,

    /**
    * 有临时关闭的功能，服务端要求再打开<br/>
    * data 为功能ID
    */
    ModuleServerOpen,

    /**
     * 模块显示状态发生改变发生改变<br/>
     * data 为剩余未显示的按钮数量
     */
    ModuleShowChanged,

    /**
     * 有模块需要检查是否会造成显示变化或者功能开启发生变更
     */
    ModuleNeedCheckShow,

    /**
     * 有模块不符合显示的条件
     * data 为功能ID
     */
    ModuleNotShow,

    /**
     * 有模块显示了
     */
    ModuleShow,
    /**
     * Mediator准备好了
     */
    MediatorReady,
}