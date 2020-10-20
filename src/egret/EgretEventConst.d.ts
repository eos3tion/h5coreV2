/**
 * 区段 -1000 - -1999
 * 
 * @export
 * @enum {number}
 */
declare const enum EventConst {
    /*===============================ListItemRender====================================*/
    /**
    * 选中未选中
    * 
    * @static
    * @type {string}
    */
    CHOOSE_STATE_CHANGE = -1000,
    /**
     * List中单击事件
     */
    ItemTouchTap = -1001,

    /**
     * 纹理加载完成
     */
    TextureComplete = -1010,
    /*===============================NumbericStepper/Slider====================================*/
    ValueChange = -1040,
    /*======================================SuiBmd=========================================== */

    /**
     * SuiBmd纹理加载失败  
     * event.data 为资源的 uri
     */
    SuiBmdLoadFailed = -1070,
    /*========================================Drag =======================================*/
    /**
     * 开始拖拽
     * data {egret.TouchEvent} touch事件
     */
    DragStart = -1090,
    /**
     * 拖拽移动
     * data {egret.TouchEvent} touch事件
     */
    DragMove,
    /**
     * 拖拽结束
     * data {egret.TouchEvent} touch事件
     */
    DragEnd,
    /**
     * Scroller开始拖拽
     */
    ScrollerDragStart,
    /**
     * Scroller结束拖拽
     */
    ScrollerDragEnd,
    /**
     * Scroller位置改变
     */
    ScrollPosChange,
}
