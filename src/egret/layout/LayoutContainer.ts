import { App, on } from "../../core/App";
import { ArraySet } from "../../core/data/ArraySet";
import { ThrowError } from "../../core/debug/ThrowError";
import { getNewPoint2 } from "../../core/geom/PointUtils";
import { getLayoutPos, LayoutType, setLayoutParamHandler } from "../../core/layout/Layout";
import { removeDisplay } from "../sui/EgretExtend";
const pt = getNewPoint2();
export abstract class LayoutContainer {
    public static readonly MIN = Object.freeze({ width: 0, height: 0 });

    protected $layoutBins = new ArraySet<LayoutBin>();

    protected _lw: number;
    protected _lh: number;

    protected _basis: Size;
    protected _host: egret.Sprite;
    constructor(basis: Size, host?: egret.Sprite) {
        host = host || new egret.Sprite();
        this._host = host;
        this._basis = basis;
        on(EventConst.ReLayout, this.onResize, this);
        host.on(EgretEvent.REMOVED_FROM_STAGE, this.offStage, this);
        host.on(EgretEvent.ADDED_TO_STAGE, this.onStage, this);
        if (host.stage) {
            this.onStage();
        }
    }

    /**
     * 重置尺寸
     * 
     * @param {Size} basis 
     * 
     * @memberOf LayoutContainer
     */
    public resetBasis(basis: Size) {
        this._basis = basis;
    }

    protected onStage() {
        this._host.stage.on(EgretEvent.RESIZE, this.onResize, this);
        this.onResize();
    }
    protected offStage() {
        egret.sys.$TempStage.off(EgretEvent.RESIZE, this.onResize, this);
    }

    abstract onResize(): any;

    public get view() {
        return this._host;
    }

    show(...dises: egret.DisplayObject[]) {
        for (let i = 0; i < dises.length; i++) {
            const dis = dises[i];
            if (dis.$layoutHost == this) {
                this._host.addChild(dis);
            }
        }

    }

    hide(...dises: egret.DisplayObject[]) {
        for (let i = 0; i < dises.length; i++) {
            const dis = dises[i];
            if (dis.$layoutHost == this) {
                removeDisplay(dis);
            }
        }
    }

    /**
     * 移除视图
     * 
     * @param {egret.DisplayObject} dis 
     * @returns 
     */
    public remove(dis: egret.DisplayObject) {
        dis.$layoutHost = undefined;
        return this.$layoutBins.delete(dis.hashCode);
    }

    addDis(dis: egret.DisplayObject, bin?: LayoutBin, hide?: boolean) {
        let list = this.$layoutBins;
        let key = dis.hashCode;
        if (list.get(key)) {
            return;
        }
        bin = bin || { type: LayoutType.TOP_LEFT, size: dis } as LayoutBin;
        bin.dis = dis;
        bin.size = bin.size || dis;
        dis.$layoutHost = this;
        list.set(key, bin);
        if (hide) {
            removeDisplay(dis);
        } else {
            this._host.addChild(dis, false);
        }
        let stage = dis.stage;
        if (stage) {
            this.binLayout(bin);
        }
        //不管在不在舞台上，都应该监听
        dis.on(EgretEvent.ADDED_TO_STAGE, this.onAdded, this);
    }

    public addLayout(dis: egret.DisplayObject, type = LayoutType.TOP_LEFT, size?: Size, left?: number, top?: number, outerV?: boolean, outerH?: boolean, hide?: boolean) {
        let list = this.$layoutBins;
        let key = dis.hashCode;
        if (list.get(key)) {
            return;
        }
        let bin = { dis, type, left, top, outerV, outerH, size } as LayoutBin;
        this.addDis(dis, bin, hide);
    }

    protected onAdded(e: egret.Event) {
        let dis = e.currentTarget as egret.DisplayObject;
        let host = dis.$layoutHost;
        if (host) {
            let set = host.$layoutBins;
            if (set) {
                let bin = set.get(dis.hashCode);
                if (bin) {
                    this.binLayout(bin);
                }
            }
        }
    }
    protected binLayout(bin: LayoutBin) {
        const { dis, type, left: hoffset, top: voffset, outerV, outerH, size } = bin;

        getLayoutPos(size.width, size.height, this._lw, this._lh, type, pt, hoffset, voffset, outerV, outerH);
        dis.x = pt.x;
        dis.y = pt.y;
    }

    protected $doLayout() {
        App.nextTick({ callback: this.layoutAll, context: this, unique: true });
    }
    protected layoutAll() {
        let set = this.$layoutBins;
        if (set) {
            let list = set.rawList;
            for (let i = 0, len = list.length; i < len;) {
                this.binLayout(list[i++]);
            }
        }
    }
}

export interface LayoutBin {
    dis?: egret.DisplayObject;
    type?: LayoutType;

    left?: number;

    top?: number;

    offsetType?: number;

    outerV?: boolean;
    outerH?: boolean;
    size?: Size;
    right?: number;
    bottom?: number;
}


const rect = new egret.Rectangle();

setLayoutParamHandler(
    function (out, layoutDis, parent) {
        let display: egret.DisplayObject;
        if (layoutDis instanceof egret.DisplayObject) {
            display = layoutDis;
        } else {
            display = layoutDis.display as egret.DisplayObject;
        }
        if (!display) {
            DEBUG && ThrowError(`执行tipLayout操作时没有设置可以显示的对象`);
            return;
        }

        let parentWidth: number, parentHeight: number, par: egret.DisplayObjectContainer;

        if (parent && parent instanceof egret.DisplayObjectContainer) {
            par = parent;
        }
        if (!par) {
            par = display.parent;
        }
        if (!par) {
            par = egret.sys.$TempStage;
        }
        if (par instanceof egret.Stage) {
            parentWidth = par.stageWidth;
            parentHeight = par.stageHeight;
        } else {
            parentWidth = par.width;
            parentHeight = par.height;
        }
        let size = layoutDis.$layoutSize;
        if (!size) {
            display.getTransformedBounds(par, rect);
            size = rect;
        }
        out.disWidth = size.width;
        out.disHeight = size.height;
        out.display = display;
        out.parentWidth = parentWidth;
        out.parentHeight = parentHeight;
    }
)