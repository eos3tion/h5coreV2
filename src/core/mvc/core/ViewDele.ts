import { DataEvent } from "../../utils/EventEmitter";

export const enum ViewDeleEvent {
    OnAwake = "OnAwake",
    OnSleep = "OnSleep",
    TouchTap = "TouchTap",
}

export interface ViewDele {

    on$(event: Key, fn: { (e: DataEvent): any }, context?: any): any;

    off$(event: Key, fn: { (e: DataEvent): any }, context?: any): any;

    visible: boolean;
    /**
     * 是否在显示列表
     */
    inStage(): boolean;
}