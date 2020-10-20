//用于将白鹭的可视对象扩展为 `ViewDele`

import { ViewDeleEvent } from "../core/mvc/core/ViewDele";

//绑定事件
let dpt: any = egret.DisplayObject.prototype;
dpt.on$ = dpt.$on;
dpt.off$ = dpt.$off;
dpt.inStage = function (this: egret.DisplayObject) {
    return this.$stage !== null;
}

//替换事件
ViewDeleEvent.OnAwake = EgretEvent.ADDED_TO_STAGE;
ViewDeleEvent.OnSleep = EgretEvent.REMOVED_FROM_STAGE;
ViewDeleEvent.TouchTap = EgretEvent.TOUCH_TAP;