import { ResItem, ResLoadCallback, ResRequest, ResLoader, Res, setResItemState } from "../../core/res/Res";
import { recyclable, Recyclable } from "../../core/utils/ClassUtils";
import { ImageLoader } from "../../../node_modules/three/src/loaders/ImageLoader";

export declare type ResImgRequest = Recyclable<ImageLoader & ResRequest>;



class Loader implements ResLoader {
    loadFile(resItem: ResItem, callback: ResLoadCallback) {
        let request = recyclable(ImageLoader);
        request.load(resItem.url,
            image => {
                setResItemState(resItem, RequestState.Complete);
                if (resItem.state == RequestState.Complete) {
                    resItem.data = image;
                }
                callback.callAndRecycle(resItem);
            },
            null,
            _ => {
                setResItemState(resItem, RequestState.Failed);
                callback.callAndRecycle(resItem);
            })
    }
}

Res.bind(ResItemType.Image, new Loader, Ext.JPG, Ext.PNG, Ext.WEBP);