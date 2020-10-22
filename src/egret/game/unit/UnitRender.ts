import { App } from "../../../core/App";
import { ActionInfo, FrameInfo } from "../animation/AnimationDefine";
import { BaseRender } from "../animation/BaseRender";
import { ResourceBitmap } from "../animation/ResourceBitmap";
import { UModel } from "./UModel";
import { Unit } from "./Unit";



/**
 * 模型(纸娃娃)渲染器
 */
export class UnitRender extends BaseRender {
    public faceTo = 0;

    /**单位**/
    protected unit: Unit;

    public actionInfo: ActionInfo;

    public model: UModel;

    protected nextRenderTime = 0;

    protected renderedTime = 0;

    constructor(unit: Unit) {
        super();
        this.unit = unit;
        this.reset(App.getNow());
    }

    public reset(now: number) {
        this.renderedTime = now;
        this.nextRenderTime = now;
        this.idx = 0;
    }

    /**
     * 处理数据
     * 
     * @param {number} now 时间戳
     */
    public doData(now: number) {
        var actionInfo = this.actionInfo;
        if (actionInfo) {
            this.onData(actionInfo, now);
        }
    }

    public render(now: number) {
        var actionInfo = this.actionInfo;
        if (actionInfo) {
            this.onData(actionInfo, now);
            this.doRender(now);
        }
    }

    onData(actionInfo: ActionInfo, now: number) {
        super.onData(actionInfo, now);
        this.unit.lastFrame = this.willRenderFrame;
    }

    clearRes() {
        //清空显示
        for (let res of <ResourceBitmap[]>this.model.$children) {
            res.texture = undefined;
        }
    }

    renderFrame(frame: FrameInfo, now: number) {
        let flag = this.model.renderFrame(frame, now, this.faceTo, this);
        this.unit.onRenderFrame(now);
        if (flag) {
            this.willRenderFrame = undefined;
        }
    }

    dispatchEvent(event: string, now: number) {
        this.unit.fire(event, now);
    }

    doComplete(now: number) {
        this.unit.playComplete(now);
    }

    public dispose() {
        this.unit = undefined;
    }
}