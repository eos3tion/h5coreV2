import { Empty } from "../../../../core/constants/Shared";
import { Heap } from "../../../../core/data/Heap";
import { Line, PointClassification } from "../../../../core/geom/Line";
import { copy, equals, getNewPoint2 } from "../../../../core/geom/PointUtils";
import { Polygon } from "../../../../core/geom/Polygon";
import { Callback } from "../../../../core/utils/Callback";
import { PathFinder, PathFinderCallback } from "../PathSolution";
import { Cell } from "./Cell";
import { NavMeshMapInfo } from "./NavMeshMapInfo";

//参考项目 https://github.com/blianchen/navMeshTest
const { abs } = Math;

const tmpPoint = getNewPoint2();
/**
 * 获取格子
 * @param pt
 * @param cells 
 */
function findClosestCell(x: number, y: number, map: NavMeshMapInfo) {
    tmpPoint.x = x;
    tmpPoint.y = y;
    const { polys, cells } = map;
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        if (cell.contain(tmpPoint)) {
            return cell;
        }
    }
    //地图外
    let edge = polys[0];
    if (!edge.contain(tmpPoint)) {
        return edge;
    }
    for (let i = 1; i < polys.length; i++) {
        const cell = polys[i];
        if (cell.contain(tmpPoint)) {
            return cell;
        }
    }
}

function getNearestCell(fx: number, fy: number, start: Polygon, cells: Cell[], calcPoint?: Point2) {
    const sides = start.sides;
    let minIdx: number;
    let min = Infinity;
    //找到离起点最近的边
    //算法参考 https://blog.csdn.net/u012138730/article/details/79779996
    for (let i = 0; i < sides.length; i++) {
        const { pA, pB } = sides[i];
        let pAx = pA.x;
        let dx = pB.x - pAx;
        let pAy = pA.y;
        let dy = pB.y - pAy;
        let pdx = fx - pAx;
        let pdy = fy - pAy;
        let d = dx * dx + dy * dy;//线段长度的平方
        let t = dx * pdx + dy * pdy;// (fx,fy)向量  点积  AB的向量
        if (d > 0) {
            t /= d;
        }
        if (t < 0) {// 当t（r）< 0时，最短距离即为 pt点 和 （A点和P点）之间的距离。
            t = 0;
        } else if (t > 1) { // 当t（r）> 1时，最短距离即为 pt点 和 （B点和P点）之间的距离。
            t = 1;
        }
        // t = 0，计算 pt点 和 A点的距离; t = 1, 计算 pt点 和 B点 的距离; 否则计算 pt点 和 投影点 的距离。
        dx = pAx + t * dx - fx;
        dy = pAy + t * dy - fy;
        let dist = dx * dx + dy * dy;
        if (dist < min) {
            min = dist;
            minIdx = i;
            if (calcPoint) {
                if (t == 0) {
                    copy(pA, calcPoint);
                } else if (t == 1) {
                    copy(pB, calcPoint);
                } else {
                    calcPoint.x = dx + fx;
                    calcPoint.y = dy + fy;
                }
            }
        }
    }
    let cell = cells[start.links[minIdx]];
    return cell;

}

function calcH(tx: number, ty: number, x: number, y: number) {
    let tmp2 = tx - x;
    tmp2 = tmp2 < 0 ? -tmp2 : tmp2;
    let tmp3 = ty - y;
    tmp3 = tmp3 < 0 ? -tmp3 : tmp3;
    return tmp2 + tmp3;
}


/**
 * 将格子进行链接，方便寻路
 * @param pv 
 */
function linkCells(pv: Cell[]) {
    const len = pv.length;
    for (let i = 0; i < len; i++) {
        const cellA = pv[i];
        for (let j = i + 1; j < len; j++) {
            const cellB = pv[j];
            cellA.checkAndLink(cellB);
        }
    }
}

function linkPolys(polys: Polygon[], cells: Cell[]) {
    const plen = polys.length;
    const clen = cells.length;
    for (let i = 0; i < plen; i++) {
        const poly = polys[i];
        poly.links = [];
        for (let j = 0; j < clen; j++) {
            let cell = cells[j];
            linkPoly(poly, cell);
        }
    }
    function linkPoly(poly: Polygon, cell: Cell) {
        let { sides, links } = poly;
        for (let i = 0; i < sides.length; i++) {
            let side = sides[i];
            let cellSides = cell.sides;
            for (let j = 0; j < cellSides.length; j++) {
                const cSide = cellSides[j];
                if (side.equals(cSide)) {
                    links[i] = cell.idx;
                    break;
                }
            }
        }
    }
}

let pathSessionId = 0;
function compare(a: Cell, b: Cell) {
    return b.f - a.f;
}

export interface PathFinderOption {

    /**
     * 起始格位
     */
    start?: Polygon;
    /**
     * 目标格位
     */
    end?: Polygon;

    /**
     * 物体通过时，离边界的宽度
     */
    width?: number;
}

export class NavMeshFinder implements PathFinder {
    map: NavMeshMapInfo;
    openList = new Heap<Cell>(0, compare);
    bindMap(map: NavMeshMapInfo) {
        this.map = map;
        if (!map.linked) {
            let { cells, polys } = map;
            linkCells(cells);
            linkPolys(polys, cells);
            map.linked = true;
        }
        this.openList.clear(map.cells.length);
    }
    getPath(fx: number, fy: number, tx: number, ty: number, callback: Callback<PathFinderCallback>, opt?: PathFinderOption) {
        const map = this.map;

        if (!map) {
            callback.callAndRecycle(null, true);
            return;
        }

        if (fx == tx && fy == ty) {
            callback.callAndRecycle(null, true);
            return;
        }

        const cells = map.cells;
        let endPos = { x: tx, y: ty };
        if (!cells) {//没有格子认为全部可走
            callback.callAndRecycle([endPos], true);
            return;
        }

        opt = opt || Empty as PathFinderOption;
        let { start, end, width = 0 } = opt;

        if (!start) {
            start = findClosestCell(fx, fy, map);
        }
        if (!start) {
            callback.callAndRecycle(null, true);
            return
        }

        if (!end) {
            end = findClosestCell(tx, ty, map);
        }
        if (!end) {
            callback.callAndRecycle(null, true);
            return
        }
        //其实和结束的格位相同
        if (start == end) {
            let result = null;
            if (start instanceof Cell) {
                result = [endPos];
            }
            callback.callAndRecycle(result, true);
            return;
        }

        let startPos = { x: fx, y: fy };

        pathSessionId++;
        let endCell: Cell, startCell: Cell;
        if (end instanceof Cell) {
            endCell = end;
        } else {
            //得到起点和终点连线临近的格子边界点
            endCell = getNearestCell(tx, ty, end, cells, tmpPoint);
            if (!endCell) {
                callback.callAndRecycle(null, true);
                return
            }
            copy(tmpPoint, endPos);
        }

        if (start instanceof Cell) {
            startCell = start;
        } else {
            startCell = getNearestCell(fx, fy, start, cells);
            if (!startCell) {
                callback.callAndRecycle(null, true);
                return
            }
        }

        //重新找到的格位相同
        if (startCell == endCell) {
            callback.callAndRecycle([endPos], true);
            return;
        }

        endCell.f = 0;
        endCell.h = 0;
        endCell.isOpen = false;
        endCell.parent = null;
        endCell.sessionId = pathSessionId;

        const openList = this.openList;
        openList.clear();
        openList.put(endCell);
        let node: Cell;

        while (openList.size > 0) {
            let currNode = openList.pop();
            //路径是在同一个三角形内
            if (currNode == startCell) {
                node = currNode;
                break;
            }

            // 2. 对当前节点相邻的每一个节点依次执行以下步骤:
            //所有邻接三角型
            let links = currNode.links;
            for (let i = 0; i < 3; i++) {
                const adjacentId = links[i];
                // 3. 如果该相邻节点不可通行或者该相邻节点已经在封闭列表中,
                //    则什么操作也不执行,继续检验下一个节点;
                if (adjacentId < 0) {//不能通过
                    continue;
                }
                let adjacentTmp = cells[adjacentId];
                if (adjacentTmp) {
                    let f = currNode.f + adjacentTmp.wallDist[abs(i - currNode.wall)] || 0;
                    if (adjacentTmp.sessionId != pathSessionId) {
                        // 4. 如果该相邻节点不在开放列表中,则将该节点添加到开放列表中, 
                        //    并将该相邻节点的父节点设为当前节点,同时保存该相邻节点的G和F值;
                        adjacentTmp.sessionId = pathSessionId;
                        adjacentTmp.parent = currNode;
                        adjacentTmp.isOpen = true;

                        //H和F值
                        adjacentTmp.h = calcH(fx, fy, adjacentTmp.x, adjacentTmp.y);
                        adjacentTmp.f = f;
                        //放入开放列表并排序
                        openList.put(adjacentTmp);
                        adjacentTmp.setWall(currNode.idx);
                    } else {
                        // 5. 如果该相邻节点在开放列表中, 
                        //    则判断若经由当前节点到达该相邻节点的G值是否小于原来保存的G值,
                        //    若小于,则将该相邻节点的父节点设为当前节点,并重新设置该相邻节点的G和F值
                        if (adjacentTmp.isOpen) {//已经在openList中
                            if (f < adjacentTmp.f) {
                                adjacentTmp.f = currNode.f;
                                adjacentTmp.parent = currNode;
                                adjacentTmp.setWall(currNode.idx);
                            }
                        }
                    }
                }
            }
        }
        let path: Point2[];
        if (node) {
            path = [];
            _tmp.cell = node;
            _tmp.pos = startPos;
            while (getWayPoint(_tmp, endPos, width)) {
                path.push(_tmp.pos);
            }
            path.push(endPos);
        }
        callback.callAndRecycle(path, true);
        return
    }
}

const _tmp = {
    cell: null as Cell,
    pos: null as Point2
}

const _lastLineA = new Line();
const _lastLineB = new Line();


function getSideAB({ wall, sides, sideLength, wallMidPt }: Cell, width: number) {
    let line = sides[wall];
    let lineLength = sideLength[wall];
    let outA = { x: 0, y: 0 };
    let outB = { x: 0, y: 0 };
    if (lineLength <= width * 2) {
        let midPt = wallMidPt[wall];
        copy(midPt, outA);
        copy(midPt, outB);
    } else {
        let { pA: { x: pAx, y: pAy }, pB: { x: pBx, y: pBy } } = line;
        let dx = pBx - pAx;
        let dy = pBy - pAy;
        let delta = width / lineLength;
        dx = dx * delta;
        dy = dy * delta;
        outA.x = pAx + dx;
        outA.y = pAy + dy;
        outB.x = pBx - dx;
        outB.y = pBy - dy;
    }
    return { pA: outA, pB: outB };
}

/**
 * 
 * @param tmp 
 * @param endPos 
 * @param width 可走宽度，如果通过边的边长低于2倍宽度，则直接走边的中点，否则按通过边的通过点+宽度得到的点
 */
function getWayPoint(tmp: { cell: Cell, pos: Point2 }, endPos: Point2, width: number) {
    let cell = tmp.cell;
    let startPt = tmp.pos;
    let outSide = getSideAB(cell, width);
    let lastPtA = outSide.pA;
    let lastPtB = outSide.pB;
    let lastLineA = _lastLineA;
    let lastLineB = _lastLineB;
    lastLineA.setPoints(startPt, lastPtA);
    lastLineB.setPoints(startPt, lastPtB);
    let lastCell = cell;
    cell = cell.parent;
    do {
        let testA, testB: Point2;
        let next = cell.parent;
        if (next) {
            let outSide = getSideAB(cell, width);
            testA = outSide.pA;
            testB = outSide.pB;
        } else {
            testA = endPos;
            testB = endPos;
        }
        if (!equals(lastPtA, testA)) {
            if (lastLineB.classifyPoint(testA) == PointClassification.RightSide) {
                tmp.cell = lastCell;
                tmp.pos = lastPtB;
                return true
            } else if (lastLineA.classifyPoint(testA) != PointClassification.LeftSide) {
                lastPtA = testA;
                lastCell = cell;
                lastLineA.setPB(lastPtA);
            }
        }
        if (!equals(lastPtB, testB)) {
            if (lastLineA.classifyPoint(testB) == PointClassification.LeftSide) {
                tmp.cell = lastCell;
                tmp.pos = lastPtA;
                return true
            } else if (lastLineB.classifyPoint(testB) != PointClassification.RightSide) {
                lastPtB = testB;
                lastCell = cell;
                lastLineB.setPB(lastPtB);
            }
        }
        cell = next;
    } while (cell)
}