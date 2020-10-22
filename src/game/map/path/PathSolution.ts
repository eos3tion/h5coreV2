import { Callback } from "../../../core/utils/Callback";
import { MapInfo } from "../MapInfo";


export interface PathFinderCallback {

    /**
     * 
     * @param {Point2[]} path 路径集
     * @param {boolean} isEnd 路径是否到达结束点
     * @param {any[]} args 
     */
    (path: Point2[], isEnd?: boolean, ...args: any[]): any;
}

export interface PathFinderOption {

}

/**
 * 
 * 寻路算法
 * @author 3tion
 * @export
 * @interface PathFinder
 */
export interface PathFinder {

    /**
     * 绑定要寻路的地图数据
     * 
     * @param {MapInfo} map
     * 
     * @memberOf PathFinder
     */
    bindMap(map: MapInfo): any;

    /**
     * 获取路径节点
     * 
     * @param {number} fx               起点坐标x
     * @param {number} fy               起点坐标y
     * @param {number} tx               终点坐标x
     * @param {number} ty               终点坐标y
     * @param {CallbackInfo<{ (path: PathNode[], ...args) }>} callback    寻找到目标后的 回调方法
     * 
     * @memberOf PathFinder
     */
    getPath(fx: number, fy: number, tx: number, ty: number, callback: Callback<PathFinderCallback>, opt?: PathFinderOption): void;
}

/**
 * 绘制路径信息
 */
export interface drawPath { (x: number, y: number, w: number, h: number, map: MapInfo): any }
