import { BaseCreator } from "../core/BaseCreator";
import { Component } from "../core/Component";
import { TouchDown } from "../utils/TouchDown";
import { MovieClip, MovieClipCreator } from "./MovieClipCreator";


export interface IButton extends Component {
    /**
     * 按钮上的标签
     * 
     * @type {string}
     * @memberof IButton
     */
    label: string;

    /**
     * 是否选中
     * 
     * @type {boolean}
     */
    selected: boolean;
    /**
     * 绑定TOUCH_TAP的回调
     * 
     * @template T 
     * @param {{ (this: T, e?: egret.Event): any }} handler 
     * @param {T} [thisObject] 
     * @param {number} [priority] 
     * @param {boolean} [useCapture] 
     */
    bindTouch<T>(handler: { (this: T, e?: egret.Event): any }, thisObject?: T, priority?: number, useCapture?: boolean): void;
    /**
     * 解除TOUCH_TAP的回调的绑定
     * 
     * @param {Function} handler
     * @param {*} thisObject
     * @param {boolean} [useCapture]
     * 
     * @memberOf Button
     */
    looseTouch(handler: Function, thisObject?: any, useCapture?: boolean): void;
}

/**
 * 
 * 新版使用MC的按钮，减少制作按钮的难度  
 * 
 * 
 * @export
 * @class MCButton
 * @extends {Button}
 */
export class MCButton extends Component implements IButton {
    mc: MovieClip;


    constructor(mc?: MovieClip) {
        super();
        if (mc) {
            this.setSkin(mc)
        }
        TouchDown.bind(this);
    }

    /**
     * 设置按钮上的标签
     */
    public set label(value: string) {
        if (this._label != value) {
            this.$setLabel(value);
        }
    }

    $setLabel(value: string) {
        let tf = this.txtLabel;
        if (tf) {
            tf.setHtmlText(value);
            this._label = value;
        }
    }

    /**
     * 获取按钮上的标签
     */
    public get label() {
        return this._label;
    }

    $setEnabled(value: boolean) {
        super.$setEnabled(value);
        this.refresh();
    }

    /**
     * 设置选中
     */
    public set selected(value: boolean) {
        if (this._selected != value) {
            this.$setSelected(value);
        }
    }

    protected $setSelected(value: boolean) {
        this._selected = value;
        this.refresh();
    }

    /**
     * 获取当前按钮选中状态
     */
    public get selected() {
        return this._selected;
    }

    /**
     * 绑定TOUCH_TAP的回调
     * 
     * @template T 
     * @param {{ (this: T, e?: egret.Event): any }} handler 
     * @param {T} [thisObject] 
     * @param {number} [priority] 
     * @param {boolean} [useCapture] 
     */
    public bindTouch<T>(handler: { (this: T, e?: egret.Event): any }, thisObject?: T, priority?: number, useCapture?: boolean) {
        this.on(EgretEvent.TOUCH_TAP, handler, thisObject, useCapture, priority);
    }

    /**
     * 解除TOUCH_TAP的回调的绑定
     * 
     * @param {Function} handler
     * @param {*} thisObject
     * @param {boolean} [useCapture]
     * 
     * @memberOf Button
     */
    public looseTouch(handler: Function, thisObject?: any, useCapture?: boolean) {
        this.off(EgretEvent.TOUCH_TAP, handler, thisObject, useCapture);
    }

    public addChild(child: egret.DisplayObject, notify = true) {
        let children = this._children;
        if (!children) {
            this._children = children = new egret.DisplayObjectContainer;
            this.refresh();
        }
        children.addChild(child, notify);
        return child;
    }

    setSkin(mc: MovieClip) {
        //检查是否有文本框
        this.txtLabel = (mc as any).tf;
        this.mc = mc;
        mc.touchEnabled = mc.touchChildren = false;
        this.addChild(mc, false);
        this.refresh();
    }

    refresh() {
        //停在指定帧
        let mc = this.mc;
        if (mc) {
            mc.stop(this.$getBtnFrame());
        }
    }

    dispose() {
        super.dispose();
        TouchDown.loose(this);
        let mc = this.mc;
        if (mc) {
            mc.dispose();
        }
    }
}
MCButton.prototype.addChild = Component.prototype.addChild;


/**
 * MC按钮创建器
 * 
 * @export
 * @class MCButtonCreator
 * @extends {BaseCreator<MCButton>}
 */
export class MCButtonCreator extends BaseCreator<MCButton> {
    public parseSelfData(data: any) {
        let suiData = this._suiData;
        let framesData = MovieClipCreator.prototype.$getFramesData(data);
        this._createT = () => new MCButton(new MovieClip(data, framesData, suiData));
    }
}
