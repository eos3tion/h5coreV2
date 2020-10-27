import { removeDisplay } from "../EgretExtend";
import { Camera } from "./camera/Camera";
import { GameLayer, BaseLayer, SortedLayer } from "./GameLayer";


/**
 * 2d游戏的引擎管理游戏层级关系<br/>
 * @author 3tion
 *
 */
export class GameEngine extends egret.EventDispatcher {
    protected static layerConfigs: { [index: number]: LayerConfig } = {};
    static instance: GameEngine;

    static init(stage: egret.Stage, ref?: { new(stage: egret.Stage): GameEngine }) {
        ref = ref || GameEngine;
        GameEngine.instance = new ref(stage);
    }

    static addLayerConfig(id: number, parentid: number = 0, ref?: new (id: number) => GameLayer) {
        let lc = <LayerConfig>{};
        lc.id = id;
        lc.parentid = parentid;
        lc.ref = ref || BaseLayer;
        GameEngine.layerConfigs[id] = lc;
    }

    /**
      * 单位坐标发生变化时调用
      */
    static invalidateSort() {
        GameEngine.instance.invalidateSort();
    }

    /**
     * 摄像机，用于处理镜头坐标相关
     */
    camera: Camera;

    protected _viewRect: egret.Rectangle;

    /**
     * 单位的排序是否发生改变
     */
    protected _sortDirty: Boolean;

    /**
     * 单位坐标发生变化时调用
     */
    invalidateSort() {
        this._sortDirty = true;
    }

    get viewRect(): egret.Rectangle {
        return this._viewRect;
    }

    protected _stage: egret.Stage;

    protected _layers: GameLayer[] = [];

    /**
     * 排序层
     */
    protected _sortedLayers: SortedLayer[] = [];

    /**
     * 获取或创建容器
     */
    getLayer(id: GameLayerID, noAdd?: boolean): GameLayer {
        let layers = this._layers;
        let layer = layers[id];
        if (!layer) {
            let cfg = GameEngine.layerConfigs[id];
            if (!cfg) {
                return;
            }
            let ref = cfg.ref;
            layer = new ref(id);
            if (!noAdd) {
                this.addLayer(layer, cfg);
            }
            layers[id] = layer;
            if (layer instanceof SortedLayer) {
                this._sortedLayers.push(layer);
            }
        }
        return layer;
    }

    /**
     * 
     * @param {GameLayer} layer 要调整的层级
     * @param {number} newid 新的层级id
     * @param {boolean} [awake=true] 是否执行一次awake
     */
    changeId(layer: GameLayer, newid: number, awake = true) {
        let id = layer.id;
        if (id != newid) {
            let layers = this._layers;
            if (layers[id] == layer) {//清理旧的id数据
                layers[id] = undefined;
            }
            layers[newid] = layer;
            layer.id = newid;
        }
        awake && this.awakeLayer(newid);
    }

    /**
     * 将指定
     * 
     * @param {GameLayerID} layerID 
     * 
     * @memberOf GameEngine
     */
    sleepLayer(layerID: GameLayerID) {
        let layer = this._layers[layerID];
        if (layer) {
            layer.isShow = false;
            removeDisplay(layer);
        }
    }

    awakeLayer(layerID: GameLayerID) {
        let layer = this._layers[layerID];
        let cfg = GameEngine.layerConfigs[layerID];
        if (layer) {
            this.addLayer(layer, cfg);
        }
    }

    protected addLayer(layer: GameLayer, cfg?: LayerConfig) {
        layer.isShow = true;
        if (cfg && cfg.parentid) {
            let parent = this.getLayer(cfg.parentid);
            if (parent instanceof egret.DisplayObjectContainer) {
                this.addLayerToContainer(layer, parent);
            }
        } else {
            this.addLayerToContainer(layer, this._stage);
        }
    }


    protected addLayerToContainer(layer: GameLayer, container: egret.DisplayObjectContainer): void {
        let children = container.$children;
        let id = layer.id;
        let j = 0;
        for (let i = 0, len = children.length; i < len; i++) {
            let child = children[i];
            if (layer != child) {
                let childLayer = <GameLayer>child;
                if (childLayer.id > id) {
                    break;
                }
                j++;
            }
        }
        container.addChildAt(layer, j);
    }

    constructor(stage: egret.Stage) {
        super();
        this._stage = stage;
        this.init();
    }

    protected init(): void {

    }

}



/**
 * 层级配置
 */
export interface LayerConfig {
    id: number;

    parentid: number;

    ref: new (id: number) => GameLayer;
}