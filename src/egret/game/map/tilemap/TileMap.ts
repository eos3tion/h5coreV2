import { ConfigUtils } from "../../../../core/configs/ConfigUtils";
import { Res, ResItem } from "../../../../core/res/Res";
import { IResource } from "../../../../core/res/ResManager";
import { Callback } from "../../../../core/utils/Callback";

/**
 * TileMap
 */
export class TileMap extends egret.Bitmap implements IResource {
    /**
     * 地图块的列
     */
    col: number;
    /**
     * 地图块的行
     */
    row: number;

    /**
     * 资源唯一标识
     */
    uri: string;

    /**
     * 
     * 是否为静态资源
     * @type {boolean}
     */
    isStatic: boolean;

    lastUseTime: number;

    /**
     * 
     * 资源路径
     * @type {string}
     */
    url: string;

    constructor() {
        super();
    }

    reset(col: number, row: number, uri: string) {
        this.col = col;
        this.row = row;
        this.uri = uri;
        this.url = ConfigUtils.getResUrl(uri);
    }

    load() {
        Res.load(this.uri, this.url, Callback.get(this.loadComplete, this));
    }

    /**
     * 资源加载完成
     */
    loadComplete(item: ResItem) {
        let { data, uri } = item as { data: egret.Texture, uri: string };
        if (!data) {//没有data说明加载资源失败
            return;
        }
        if (uri == this.uri) {
            this.texture = data;
        }
    }

    dispose() {
        let texture = this.texture;
        if (texture) {
            this.texture = undefined;
            texture.dispose();
        }
    }
}