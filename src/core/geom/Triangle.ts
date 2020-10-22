import { getCenter } from "./GeomUtils";
import { Line, PointClassification } from "./Line";
import { copy, getNewPoint2 } from "./PointUtils";
import { Polygon } from "./Polygon";
export const enum TrangleSideIndex {
    SideAB = 0,
    SideBC = 1,
    SideCA = 2
}


export class Triangle extends Polygon {

    /**
     * 顶点列表
     */
    points: Point2[];

    readonly pA: Point2;
    readonly pB: Point2;
    readonly pC: Point2;


    sides = [new Line, new Line, new Line];
    /**
     * 三角的中心x
     */
    readonly x = 0;
    /**
     * 三角的中心y
     */
    readonly y = 0;
    /**
     * 数据是否计算过
     */
    protected _calced = false;

    constructor(p1?: Point2, p2?: Point2, p3?: Point2) {
        super();
        this.pA = p1 || getNewPoint2();
        this.pB = p2 || getNewPoint2();
        this.pC = p3 || getNewPoint2();
        this.points = [p1, p2, p3];
    }

    setPoints(p1: Point2, p2: Point2, p3: Point2) {
        const { pA, pB, pC } = this;
        copy(p1, pA);
        copy(p2, pB);
        copy(p3, pC);
        this._calced = false;
        return this;
    }

    calculateData() {
        if (!this._calced) {
            const { pA, pB, pC } = this;
            getCenter(this.points, this);
            const sides = this.sides;
            sides[TrangleSideIndex.SideAB].setPoints(pA, pB); // line AB
            sides[TrangleSideIndex.SideBC].setPoints(pB, pC); // line BC
            sides[TrangleSideIndex.SideCA].setPoints(pC, pA); // line CA
            this._calced = true;
        }
    }

    /**
     * 检查点是否在三角形中间
     * @param testPoint 
     */
    contain(testPoint: Point2) {
        this.calculateData();
        // 点在所有边的右面或者线上
        return this.sides.every(
            side =>
                side.classifyPoint(testPoint) != PointClassification.LeftSide
        );
    }
}
