declare const enum EventConst {

    //=============UI事件/Dom事件==============================
    //https://developer.mozilla.org/en-US/docs/Web/Events
    Added = "added",
    Removed = "removed",
    Complete = "complete",
    Error = "error",
    PointerDown = "pointerdown",
    PointerMove = "pointermove",
    PointerUp = "pointerup",
    PointerCancel = "pointercancel",
    KeyDown = "keydown",
    KeyUp = "keyup",
    Load = "load",
    AnimationFinished = "finished",

    Reload = "reload",
    /**
     * 渲染尺寸发生改变
     */
    Resize = "resize",
    //=============基础库核心事件==============================

    ParseResHash = -2000,
    ResLoadFailed,
    ResLoadSuccess,
    /**
     * 单配置完成
     */
    OneCfgComplete,
    /**
     * 配置解析完成
     */
    CfgComplete,
    /**
     * 屏幕按下
     */
    TouchDown,
    /**
     * 按下时移动
     */
    TouchMove,
    /**
     * 屏幕松开
     */
    TouchUp,
    /**
     * App被唤醒，加入到前台
     */
    AppAwake,
    /**
     * App进入后台
     */
    AppSleep,
}