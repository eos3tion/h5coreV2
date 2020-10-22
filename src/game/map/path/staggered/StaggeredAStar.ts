import { Empty } from "../../../../core/constants/Shared";
import { Callback } from "../../../../core/utils/Callback";
import { PathNode } from "../grid/Astar";
import { PathFinderCallback } from "../PathSolution";
import { StaggeredMapInfo } from "./StaggeredMapInfo";


export interface PathFinderOption {
    minCacTime?: number;
    /**
     * 是否同步处理
     */
    sync?: boolean;
    /**
     * 默认当前地图格子总数
     */
    max?: number;
}


const enum Const {
    /**
     * 最小执行时间
     */
    MinCacTime = 5,
}

export function getAStar() {
    let _map: StaggeredMapInfo;
    let _maxLength = 2000;
    let w: number;
    let h: number;
    /**
     * PathNode的字典
     * Key      {number}    y * w + x
     * value    {PathNode}  节点
     */
    const list = [] as PathNode[];
    /**待检测点 */
    const openList = [] as PathNode[];
    /**已搜寻过的点 */
    const closedList = [] as (PathNode | true)[];
    const stage = egret.sys.$TempStage;
    let cb: Callback<PathFinderCallback>;
    let current = 0;
    let stop = false;
    let minNode: PathNode;
    let _max = _maxLength;
    let _tx = 0, _ty = 0;
    let _tpx = 0, _tpy = 0;
    /**
     * y相同的横向排位
     * ```
     * ◇◆◇
     * ```
     */
    let G_sameY: number;
    /**
     * y差值为2的纵向排位
     * ```
     *      ◇
     *      ◆
     *      ◇
     * ```
     */
    let G_deltaYeq2: number;

    /**
     * 斜向格子
     * ```
     *    ◇ ◇
     *     ◆
     *    ◇ ◇
     * ```
     */
    let G_skew: number;

    let _minCacTime: number;
    return {
        bindMap,
        getPath,
        stop() {
            stop = true;
        }
    }
    function bindMap(map: StaggeredMapInfo) {
        _map = map;
        let { columns, rows, gridWidth, gridHeight } = map;
        _maxLength = columns * rows;
        G_sameY = gridWidth * .5;
        G_deltaYeq2 = gridHeight * .5;
        G_skew = Math.sqrt(G_sameY * G_sameY + G_deltaYeq2 * G_deltaYeq2) * .5;
        w = map.columns;
        h = map.rows;
    }

    function getPath(fx: number, fy: number, tx: number, ty: number, callback: Callback<PathFinderCallback>, opt?: PathFinderOption) {
        if (!_map || fx == tx && fy == ty) {
            return callback.callAndRecycle(null, true);
        }
        cb = callback;
        stop = false;
        list.length = 0;
        openList.length = 0;
        closedList.length = 0;
        const { sync, max, minCacTime } = opt || Empty as PathFinderOption;
        _max = max || _maxLength;
        _minCacTime = minCacTime || Const.MinCacTime;
        _tx = tx;
        _ty = ty;
        let pt = _map.map2Screen(_tx, _ty, true);
        _tpx = pt.x;
        _tpy = pt.y;
        minNode = null;
        current = 0;
        add(fx, fy, 0, getH(fx, fy));
        if (sync) {
            let result: boolean;
            do {
                result = onTick();
            }
            while (!result)
        } else {
            stage.on(EgretEvent.ENTER_FRAME, onTick)
        }
    }
    function onTick() {
        let t = Date.now();
        while (openList.length) {
            if (stop) {//如果外部控制结束
                cb.callAndRecycle(end(minNode), false);//现在外部结束，也给个结果，不过认为没结束
                return true;
            }
            let node = openList.shift();
            const { x, y, g, key } = node;
            if (closedList[key]) {
                continue;
            }
            //标记已经搜索过的
            closedList[key] = true;
            if (x == _tx && y == _ty) {//找到终点
                cb.callAndRecycle(end(minNode), true);
                return true;
            }

            let G = _map.getWalk(x, y);
            for (let face = 0; face < 8; face++) {
                let { x: tmpx, y: tmpy } = _map.getFacePos(x, y, face)
                if (tmpx < 0 || tmpy < 0 || tmpx >= w || tmpy >= h) {
                    continue;
                }
                let currentG = _map.getWalk(tmpx, tmpy);
                if (currentG == 0 || closedList[tmpy * w + tmpx]) {
                    continue;
                }
                let tmpG = 0;
                let deltaY = Math.abs(tmpy - y);
                if (deltaY == 0) {//横向坐标相同，
                    tmpG = G_sameY;
                } else if (deltaY == 2) {
                    tmpG = G_deltaYeq2;
                } else {
                    tmpG = G_skew;
                }
                tmpG = tmpG / G + tmpG / currentG + g;
                add(tmpx, tmpy, tmpG, getH(tmpx, tmpy), node);
            }

            current++;
            if (current > _max) {
                break;
            }

            if (Date.now() - t > _minCacTime) {//超过执行时间，下帧再执行
                return;
            }
        }
        cb.callAndRecycle(end(minNode), false);
        return true;
    }
    function getH(tx: number, ty: number) {
        let ts = _map.map2Screen(tx, ty, true);
        let dx = ts.x - _tpx;
        let dy = ts.y - _tpy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    function end(node: PathNode): PathNode[] {
        // 移除监听
        stage.off(EgretEvent.ENTER_FRAME, onTick);
        let list = [];
        for (let i = node.step; i > 0; i--) {
            list[i - 1] = node;
            node = node.prev;
        }
        return list;
    }
    function add(x: number, y: number, g: number, h: number, prev?: PathNode) {
        let key = y * w + x;
        let node = list[key];
        let f = g + h;
        if (!node) {
            list[key] = node = { key, x, y, g, h, f, prev, step: prev ? prev.step + 1 : 0 };
        }
        //得到预估值最小的节点
        if (minNode) {
            let minH = minNode.h;
            if (minH > h || minH == h && minNode.g > g) {
                minNode = node;
            }
        } else {
            minNode = node;
        }
        let len = openList.length;
        if (len) {
            let idx = len >> 1;
            let num = len;
            len--;
            //使用二分法将节点进行重新排序
            while (num > 1) {
                num = (num + (num & 1)) >> 1;
                if (f <= openList[idx].f) {
                    idx -= num;
                    if (idx < 0) idx = 0;
                }
                else {
                    idx += num;
                    if (idx > len) {
                        idx = len;
                    }
                }
            }
            if (f > openList[idx].f) {
                idx++;
            }
            for (var i = len + 1; i > idx; i--) {
                openList[i] = openList[i - 1];
            }
            openList[i] = node;
        } else {
            openList[0] = node;
        }
    }
}
