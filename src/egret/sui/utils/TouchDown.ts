import { App } from "../../../core/App";
import { Ease } from "../../../core/tween/Ease";
import { Tween } from "../../../core/tween/Tween";
const enum TouchDownConst {
    /**
     * TouchDown时放大比例
     */
    Scale = 1.125,
    /**
     * 居中后的乘数
     * (Scale-1)*0.5
     */
    Multi = (Scale - 1) * 0.5
}

/**
 * 可做TouchDown放大的对象接口
 */
export interface TouchDownItem extends egret.DisplayObject {
    $_tdi?: TouchDownData;
}

export interface TouchDownBin {
    x?: number;
    y?: number;

    scaleX: number;
    scaleY: number;
}

export interface TouchDownData {

    raw: TouchDownBin;
    tween: Tween;
}

const _$TDOpt = Object.freeze({ int: { x: 1, y: 1 } });
/**
 * TouchDown显示对象放大效果
 */
export module TouchDown {

    /**
     * 绑定组件
     * 
     * @param {TouchDownItem} item
     */
    export function bind(item: TouchDownItem) {
        if (item) {
            item.on(EgretEvent.TOUCH_BEGIN, touchBegin);
        }
    }
    /**
     * 解绑组件
     * 
     * @param {TouchDownItem} item
     */
    export function loose(item: TouchDownItem) {
        if (item) {
            item.off(EgretEvent.TOUCH_BEGIN, touchBegin);
            clearEndListener(item);
        }
    }

    /**
     * 重置组件
     * 
     * @export
     * @param {TouchDownItem} item 
     */
    export function reset(item: TouchDownItem) {
        let data = item.$_tdi;
        if (data) {
            let { tween, raw } = data;
            if (tween) {
                App.tweenManager.removeTween(tween);
            }
            if (raw) {
                let { x, y, scaleX, scaleY } = raw;
                item.x = x;
                item.y = y;
                item.scaleX = scaleX;
                item.scaleY = scaleY;
            }
            item.$_tdi = undefined;
        }
    }


    function clearEndListener(item: TouchDownItem) {
        item.off(EgretEvent.TOUCH_END, touchEnd);
        item.off(EgretEvent.TOUCH_CANCEL, touchEnd);
        item.off(EgretEvent.TOUCH_RELEASE_OUTSIDE, touchEnd);
        item.off(EgretEvent.REMOVED_FROM_STAGE, touchEnd);
    }

    function touchBegin(e: egret.Event) {
        let target = e.target as TouchDownItem;
        target.on(EgretEvent.TOUCH_END, touchEnd);
        target.on(EgretEvent.TOUCH_CANCEL, touchEnd);
        target.on(EgretEvent.TOUCH_RELEASE_OUTSIDE, touchEnd);
        target.on(EgretEvent.REMOVED_FROM_STAGE, touchEnd);
        let data = target.$_tdi;
        let tm = App.tweenManager;
        if (data) {
            let tween = data.tween;
            if (tween) {
                tm.removeTween(tween);
            }
        } else {
            target.$_tdi = data = {} as TouchDownData;
            let { x, y, scaleX, scaleY } = target;
            data.raw = { x, y, scaleX, scaleY };
        }
        let raw = data.raw;
        data.tween = tm.get(target, _$TDOpt).to({ x: raw.x - target.width * TouchDownConst.Multi, y: raw.y - target.height * TouchDownConst.Multi, scaleX: TouchDownConst.Scale * raw.scaleX, scaleY: TouchDownConst.Scale * raw.scaleY }, 100, Ease.quadOut);
    }

    function touchEnd(e: egret.Event) {
        let target = e.target as TouchDownItem;
        clearEndListener(target);
        let raw = target.$_tdi;
        if (raw) {
            let tween = raw.tween;

            if (tween) {
                App.tweenManager.removeTween(tween);
            }
            raw.tween = App.tweenManager.get(target, _$TDOpt)
                .to(raw.raw, 100, Ease.quadOut)
                .call(endComplete, null, target);
        }
    }

    function endComplete(target: TouchDownItem) {
        target.$_tdi = undefined;
    }
}
