import { dist2, equals, getNewPoint2, interpolate } from "../../../../core/geom/PointUtils";
import { TrangleSideIndex, Triangle } from "../../../../core/geom/Triangle";


function getMidPoint(midPoint: Point2, pA: Point2, pB: Point2) {
    interpolate(pA, pB, .5, midPoint);
    return midPoint;
}

/**
  * 获得两个点的相邻的三角形
  * @param pA 
  * @param pB 
  * @param caller true 如果提供的两个点是caller的一个边
  */
function requestLink(pA: Point2, pB: Point2, index: number, target: Cell) {
    const { pA: pointA, pB: pointB, pC: pointC, links } = target;
    if (equals(pointA, pA)) {
        if (equals(pointB, pB)) {
            links[TrangleSideIndex.SideAB] = index;
            return true;
        } else if (equals(pointC, pB)) {
            links[TrangleSideIndex.SideCA] = index;
            return true;
        }
    } else if (equals(pointB, pA)) {
        if (equals(pointA, pB)) {
            links[TrangleSideIndex.SideAB] = index;
            return true;
        } else if (equals(pointC, pB)) {
            links[TrangleSideIndex.SideBC] = index;
            return true;
        }
    } else if (equals(pointC, pA)) {
        if (equals(pointA, pB)) {
            links[TrangleSideIndex.SideCA] = index;
            return true;
        } else if (equals(pointB, pB)) {
            links[TrangleSideIndex.SideBC] = index;
            return true;
        }
    }
}


export class Cell extends Triangle {
    f = 0;
    h = 0;

    isOpen = false;

    parent: Cell = null;

    sessionId = 0;

    idx: number;

    readonly links = [-1, -1, -1];

    /**
     * 每边的中点
     */
    readonly wallMidPt = [getNewPoint2(), getNewPoint2(), getNewPoint2()] as { [idx: number]: Point2 };
    /**
     * 每边中点距离
     */
    readonly wallDist = [0, 0, 0];

    /**
     * 边长
     */
    readonly sideLength = [0, 0, 0];

    /**
     * 通过墙的索引
     */
    wall = -1;


    init() {
        this.calculateData();
        const { wallMidPt: m_WallMidpoint, wallDist: m_WallDistance, pA, pB, pC, sideLength, sides } = this;
        let mAB = getMidPoint(m_WallMidpoint[TrangleSideIndex.SideAB], pA, pB);
        let mBC = getMidPoint(m_WallMidpoint[TrangleSideIndex.SideBC], pB, pC);
        let mCA = getMidPoint(m_WallMidpoint[TrangleSideIndex.SideCA], pC, pA);
        sides.forEach((side, idx) => {
            sideLength[idx] = dist2(side.pA, side.pB);
        })
        m_WallDistance[0] = dist2(mAB, mBC);
        m_WallDistance[1] = dist2(mCA, mBC);
        m_WallDistance[2] = dist2(mAB, mCA);
    }

    /**
     * 检查并设置当前三角型与`cellB`的连接关系（方法会同时设置`cellB`与该三角型的连接）
     * @param cellB 
     */
    checkAndLink(cellB: Cell): void {
        const { pA, pB, pC, links, idx: index } = this;
        let idx = cellB.idx;
        if (links[TrangleSideIndex.SideAB] == -1 && requestLink(pA, pB, index, cellB)) {
            links[TrangleSideIndex.SideAB] = idx;
        } else if (links[TrangleSideIndex.SideBC] == -1 && requestLink(pB, pC, index, cellB)) {
            links[TrangleSideIndex.SideBC] = idx;
        } else if (links[TrangleSideIndex.SideCA] == -1 && requestLink(pC, pA, index, cellB)) {
            links[TrangleSideIndex.SideCA] = idx;
        }
    }
    /**
     * 记录路径从上一个节点进入该节点的边（如果从终点开始寻路即为穿出边）
     * @param index	路径上一个节点的索引
     */
    setWall(index: number) {
        let m_ArrivalWall = -1;
        const links = this.links;
        if (index == links[0]) {
            m_ArrivalWall = 0;
        } else if (index == links[1]) {
            m_ArrivalWall = 1;
        } else if (index == links[2]) {
            m_ArrivalWall = 2;
        }
        if (m_ArrivalWall != -1) {
            this.wall = m_ArrivalWall;
        }
        return m_ArrivalWall;
    }

}
