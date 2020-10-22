import { ConfigUtils } from "../../../core/configs/ConfigUtils";
import { Res, ResItem, ResQueueID } from "../../../core/res/Res";
import { removeFrom } from "../../../core/utils/ArrayUtil";
import { Callback } from "../../../core/utils/Callback";
import { ActionInfo } from "./AnimationDefine";
import { AniRender } from "./AniRender";
import { PstInfo } from "./PstInfo";
import { UnitResourceConst, UnitResource } from "./UnitResource";

/**
 * 用于处理无方向的动画信息
 * @author 3tion
 *
 */
export class AniInfo extends PstInfo {
    /**
     * 加载状态
     */
    public state: RequestState = RequestState.UnRequest;

    protected _refList: AniRender[];

    url: string;

    uri: string;

    /**
     * 资源加载列队，用于控制加载优先级
     */
    qid?: ResQueueID;
    public constructor() {
        super();
    }


    /**
     * 绑定渲染器
     * @param render
     */
    public bind(render: AniRender) {
        let state = this.state;
        if (state != RequestState.Complete) {
            if (!this._refList) {
                this._refList = [];
            }
            this._refList.push(render);
            if (state == RequestState.UnRequest) {
                let uri = this.uri = ResPrefix.Ani + this.key + "/" + UnitResourceConst.CfgFile;
                let url = this.url = ConfigUtils.getResUrl(uri);
                Res.load(uri, url, Callback.get(this.dataLoadComplete, this), this.qid);
                this.state = RequestState.Requesting;
            }
        }
    }

    /**
     * 资源加载完成
     */
    dataLoadComplete(item: ResItem) {
        let { uri, data } = item;
        if (uri == this.uri) {
            if (data) {
                this.init(this.key, data);
                if (this._refList) {
                    for (let render of this._refList) {
                        render.callback();
                    }
                }
            } else {
                this.state = RequestState.Failed;
            }
            this._refList = undefined;
        }
    }

    /**
     * 和渲染器解除绑定
     * @param render
     */
    public loose(render: AniRender) {
        let _refList = this._refList;
        if (_refList) {
            removeFrom(_refList, render);
        }
    }


    public init(key: string, data: any[]) {
        super.init(key, data[0]);
        let res: UnitResource = new UnitResource(ResPrefix.Ani + key, this);
        res.qid = this.qid;
        res.decodeData(data[1]);
        this._resources = res;
        this.state = RequestState.Complete;
    }

    getResource(uri?: string): UnitResource {
        return <UnitResource>this._resources;
    }

    public get actionInfo(): ActionInfo {
        let frames = this.frames;
        return frames && frames[0]
    }
}

