import { ResLoader, Res, ResItem, ResLoadCallback, setResItemState } from "../../core/res/Res";
import { FBXLoader } from "../../../libs/FBXLoader.js";
import { recyclable } from "../../core/utils/ClassUtils";
import { parsePath } from "../../core/utils/Path";
export interface FBXResItem extends ResItem {
    /**
     * 是否不加载纹理
     */
    notLoadTexture?: boolean;
}

class Loader implements ResLoader {

    loadFile(resItem: ResItem, callback: ResLoadCallback) {
        let request = recyclable(FBXLoader);
        let url = resItem.url;
        let parsedPath = parsePath(url);
        request.notLoadTexture = (resItem as FBXResItem).notLoadTexture;
        request.setPath(parsedPath.dir + "/").load(parsedPath.base,
            group => {
                setResItemState(resItem, RequestState.Complete);
                if (resItem.state == RequestState.Complete) {
                    resItem.data = group;
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

Res.bind(ResItemType.FBX, new Loader, Ext.FBX);