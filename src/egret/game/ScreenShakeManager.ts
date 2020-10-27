import { App } from "../../core/App";
import { Shake } from "../../game/shake/Shake";
import { GameEngine } from "./GameEngine";


/**
 * 屏幕抖动管理器
 * 
 * @export
 * @class ScreenShakeManager
 */
export class ScreenShakeManager {

    /**
     * 释放可震动
     * 
     * @type {boolean}
     */
    shakable: boolean = true;

    /**
     * 当前的震动
     * 
     * @private
     * @type {Shake}
     */
    _cur: Shake;

    _limits: egret.Rectangle;

    _pt = { x: 0, y: 0 };
    guid: number;

    setLimits(width = Infinity, height = Infinity, x = 0, y = 0) {
        this._limits = new egret.Rectangle(x, y, width, height);
        return this;
    }



    /**
     * 
     * 开始时间
     * @protected
     * @type {number}
     */
    protected _st: number;


    /**
     * 开始一个新的震动
     * 
     * @template T 
     * @param {T} shake 
     * @returns T
     */
    start<T extends Shake>(shake: T) {
        if (this.shakable) {
            let cur = this._cur;
            if (cur) {
                cur.end();
            }
            this._cur = shake;
            let engine = GameEngine.instance;
            let layer = engine.getLayer(GameLayerID.Game);
            if (cur != shake) {
                shake.setShakeTarget(layer);
            }
            shake.setTargetPos().start();
            this._st = App.getNow();
            this.guid = App.addTick(0, {
                callback: tick,
                context: this,
                unique: true
            });
        }
        return shake;
    }

}

function tick(this: ScreenShakeManager) {
    let shake = this._cur;
    let duration = App.getNow() - this._st;
    if (duration < shake.total) {
        let pt = this._pt;
        let cur = this._cur;
        cur.tick(duration, pt);
        let target = cur.target;
        let limits = this._limits;
        let px = pt.x;
        let py = pt.y;
        let x = px, y = py;
        if (limits) {
            let rect = GameEngine.instance.viewRect;
            if (px < 0) {
                let lx = limits.x;
                let rx = rect.x;
                x = rx + px > lx ? px : lx;
            } else {
                let dw = limits.width - rect.width;
                x = px < dw ? px : dw;
            }
            if (py < 0) {
                let ly = limits.y;
                let ry = rect.y;
                y = ry + py > ly ? px : ly;
            } else {
                let dh = limits.height - rect.height;
                y = py < dh ? py : dh;
            }
        }
        target.x = x;
        target.y = y;
    } else {
        shake.end();
        App.removeTick(this.guid);
        this.guid = undefined;
    }
}
