import { ResQueueID, ResItem, Res as _Res } from "./Res";
import { Callback } from "../utils/Callback";

export namespace Res {
    export function load(uri: string, url?: string, queueID = ResQueueID.Normal): Promise<ResItem> {
        return new Promise((resolve) => {
            _Res.load(uri, url, Callback.get(resolve), queueID)
        })
    }

    export function loadRes(resItem: ResItem, queueID = ResQueueID.Normal): Promise<ResItem> {
        return new Promise((resolve) => {
            _Res.loadRes(resItem, Callback.get(resolve), queueID)
        })
    }

    export function loadList(list: ResItem[], group: Key, onProgress?: Callback<{ (item: ResItem): any }>, queueID = ResQueueID.Normal) {
        return new Promise<boolean>(resolve => {
            _Res.loadList(list, {
                callback: Callback.get(resolve),
                group,
                onProgress
            }, queueID);
        })
    }
}