import { DataEvent } from "../../utils/EventEmitter";

/**
 * ViewDele用的事件
 */
export const ViewDeleEvent = {
    OnAwake: "OnAwake",
    OnSleep: "OnSleep",
    TouchTap: "TouchTap",
}

export interface ViewDele {

    /**
     * 添加事件
     * @param event 
     * @param fn 
     * @param context 
     */
    on$(event: Key, fn: { (e: DataEvent): any }, context?: any): any;

    /**
     * 移除事件
     * @param event 
     * @param fn 
     * @param context 
     */
    off$(event: Key, fn: { (e: DataEvent): any }, context?: any): any;

    /**
     * 是否可见
     */
    visible: boolean;
    /**
     * 是否在显示列表中
     */
    inStage(): boolean;
}