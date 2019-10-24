/**
 * Laya的事件常量集
 */
declare const enum LayaEvent {
    /** 定义 mousedown 事件对象的 type 属性值。*/
    MOUSE_DOWN = "mousedown",
    /** 定义 mouseup 事件对象的 type 属性值。*/
    MOUSE_UP = "mouseup",
    /** 定义 click 事件对象的 type 属性值。*/
    CLICK = "click",
    /** 定义 rightmousedown 事件对象的 type 属性值。*/
    RIGHT_MOUSE_DOWN = "rightmousedown",
    /** 定义 rightmouseup 事件对象的 type 属性值。*/
    RIGHT_MOUSE_UP = "rightmouseup",
    /** 定义 rightclick 事件对象的 type 属性值。*/
    RIGHT_CLICK = "rightclick",
    /** 定义 mousemove 事件对象的 type 属性值。*/
    MOUSE_MOVE = "mousemove",
    /** 定义 mouseover 事件对象的 type 属性值。*/
    MOUSE_OVER = "mouseover",
    /** 定义 mouseout 事件对象的 type 属性值。*/
    MOUSE_OUT = "mouseout",
    /** 定义 mousewheel 事件对象的 type 属性值。*/
    MOUSE_WHEEL = "mousewheel",
    /** 定义 mouseover 事件对象的 type 属性值。*/
    ROLL_OVER = "mouseover",
    /** 定义 mouseout 事件对象的 type 属性值。*/
    ROLL_OUT = "mouseout",
    /** 定义 doubleclick 事件对象的 type 属性值。*/
    DOUBLE_CLICK = "doubleclick",
    /** 定义 change 事件对象的 type 属性值。*/
    CHANGE = "change",
    /** 定义 changed 事件对象的 type 属性值。*/
    CHANGED = "changed",
    /** 定义 resize 事件对象的 type 属性值。*/
    RESIZE = "resize",
    /** 定义 added 事件对象的 type 属性值。*/
    ADDED = "added",
    /** 定义 removed 事件对象的 type 属性值。*/
    REMOVED = "removed",
    /** 定义 display 事件对象的 type 属性值。*/
    DISPLAY = "display",
    /** 定义 undisplay 事件对象的 type 属性值。*/
    UNDISPLAY = "undisplay",
    /** 定义 error 事件对象的 type 属性值。*/
    ERROR = "error",
    /** 定义 complete 事件对象的 type 属性值。*/
    COMPLETE = "complete",
    /** 定义 loaded 事件对象的 type 属性值。*/
    LOADED = "loaded",
    /** 定义 loaded 事件对象的 type 属性值。*/
    READY = "ready",
    /** 定义 progress 事件对象的 type 属性值。*/
    PROGRESS = "progress",
    /** 定义 input 事件对象的 type 属性值。*/
    INPUT = "input",
    /** 定义 render 事件对象的 type 属性值。*/
    RENDER = "render",
    /** 定义 open 事件对象的 type 属性值。*/
    OPEN = "open",
    /** 定义 message 事件对象的 type 属性值。*/
    MESSAGE = "message",
    /** 定义 close 事件对象的 type 属性值。*/
    CLOSE = "close",
    /** 定义 keydown 事件对象的 type 属性值。*/
    KEY_DOWN = "keydown",
    /** 定义 keypress 事件对象的 type 属性值。*/
    KEY_PRESS = "keypress",
    /** 定义 keyup 事件对象的 type 属性值。*/
    KEY_UP = "keyup",
    /** 定义 frame 事件对象的 type 属性值。*/
    FRAME = "enterframe",
    /** 定义 dragstart 事件对象的 type 属性值。*/
    DRAG_START = "dragstart",
    /** 定义 dragmove 事件对象的 type 属性值。*/
    DRAG_MOVE = "dragmove",
    /** 定义 dragend 事件对象的 type 属性值。*/
    DRAG_END = "dragend",
    /** 定义 enter 事件对象的 type 属性值。*/
    ENTER = "enter",
    /** 定义 select 事件对象的 type 属性值。*/
    SELECT = "select",
    /** 定义 blur 事件对象的 type 属性值。*/
    BLUR = "blur",
    /** 定义 focus 事件对象的 type 属性值。*/
    FOCUS = "focus",
    /** 定义 visibilitychange 事件对象的 type 属性值。*/
    VISIBILITY_CHANGE = "visibilitychange",
    /** 定义 focuschange 事件对象的 type 属性值。*/
    FOCUS_CHANGE = "focuschange",
    /** 定义 played 事件对象的 type 属性值。*/
    PLAYED = "played",
    /** 定义 paused 事件对象的 type 属性值。*/
    PAUSED = "paused",
    /** 定义 stopped 事件对象的 type 属性值。*/
    STOPPED = "stopped",
    /** 定义 start 事件对象的 type 属性值。*/
    START = "start",
    /** 定义 end 事件对象的 type 属性值。*/
    END = "end",
    /** 定义 componentadded 事件对象的 type 属性值。*/
    COMPONENT_ADDED = "componentadded",
    /** 定义 componentremoved 事件对象的 type 属性值。*/
    COMPONENT_REMOVED = "componentremoved",
    /** 定义 released 事件对象的 type 属性值。*/
    RELEASED = "released",
    /** 定义 link 事件对象的 type 属性值。*/
    LINK = "link",
    /** 定义 label 事件对象的 type 属性值。*/
    LABEL = "label",
    /**浏览器全屏更改时触发*/
    FULL_SCREEN_CHANGE = "fullscreenchange",
    /**显卡设备丢失时触发*/
    DEVICE_LOST = "devicelost",
    /**世界矩阵更新时触发。*/
    TRANSFORM_CHANGED = "transformchanged",
    /**更换动作时触发。*/
    ANIMATION_CHANGED = "animationchanged",
    /**拖尾渲染节点改变时触发。*/
    TRAIL_FILTER_CHANGE = "trailfilterchange",
    /**物理碰撞开始*/
    TRIGGER_ENTER = "triggerenter",
    /**物理碰撞持续*/
    TRIGGER_STAY = "triggerstay",
    /**物理碰撞结束*/
    TRIGGER_EXIT = "triggerexit",
}