import { copy, getDirection, subtract, dot, equals, getNewPoint2 } from "./PointUtils";
/**
 * 点所在的位置
 */
export const enum PointClassification {
    /**
     * 点离在线上，或者离得非常非常近（低于精度）
     */
    OnLine = 0,
    /**
     * 按端点A->端点B，点在线的左边
     */
    LeftSide = 1,
    /**
     * 按端点A->端点B，点在线的右边
     */
    RightSide = 2
}

/**
 * 线段位置情况的定义
 */
export const enum LineClassification {
    /**
     * 共线
     */
    Collinear = 0,
    /**
     * 线段不相交，线段所在直线相交
     */
    LinesIntersect = 1,
    /**
     * 两条线段相交
     */
    SegmentsIntersect = 2,
    /**
     * 线段不想交，线段所在直线相交，交点在传入检查的线段上
     */
    ABisectB = 3,
    /**
     * 线段不想交，线段所在直线相交，交点在当前线上
     */
    BBisectA = 4,
    /**
     * 平行
     */
    Paralell = 5

}

let tmpPt = getNewPoint2();

export class Line {
    readonly pA = getNewPoint2() as Readonly<Point2>

    readonly pB = getNewPoint2() as Readonly<Point2>

    /**
     * 是否计算过法线
     */
    private calcedNormal: boolean;
    /**
     * 法线
     */
    m_Normal: Point2;

    setPA(pt: Point2) {
        copy(pt, this.pA);
        this.calcedNormal = false;
        return this;
    }

    setPB(pt: Point2) {
        copy(pt, this.pB);
        this.calcedNormal = false;
        return this;
    }

    setPoints(pA: Point2, pB: Point2) {
        copy(pA, this.pA);
        copy(pB, this.pB);
        this.calcedNormal = false;
        return this;
    }
    computeNormal() {
        if (!this.calcedNormal) {
            // Get Normailized direction from A to B
            let m_Normal = getDirection(this.pA, this.pB);

            // Rotate by -90 degrees to get normal of line
            // Rotate by +90 degrees to get normal of line
            let oldYValue = m_Normal.y;
            m_Normal.y = m_Normal.x;
            m_Normal.x = -oldYValue;
            this.m_Normal = m_Normal;
            this.calcedNormal = true;
        }
    }

    signedDistance(point: Point2) {
        this.computeNormal();
        copy(point, tmpPt);
        let v2f = subtract(tmpPt, this.pA);
        return dot(this.m_Normal, v2f);
    }

    /**
     * 检查点的位置
     * @param point 要检查的点
     * @param epsilon 精度，默认0.000001
     */
    classifyPoint(point: Point2, epsilon = 1e-6) {
        let result = PointClassification.OnLine;
        let distance = this.signedDistance(point);
        if (distance > epsilon) {
            result = PointClassification.RightSide;
        }
        else if (distance < -epsilon) {
            result = PointClassification.LeftSide;
        }
        return result;
    }

    intersection(other: Line, intersectPoint?: Point2) {
        const { pA: { x: opAX, y: opAY }, pB: { x: opBX, y: opBY } } = other;
        const { pA: { x: pAX, y: pAY }, pB: { x: pBX, y: pBY } } = this;
        const doY = opBY - opAY;
        const doX = opBX - opAX;
        const dtY = pBY - pAY;
        const dtX = pBX - pAX;
        const dx = opAX - pAX;
        const dy = opAY - pAY;
        const denom = doY * dtX - doX * dtY;
        let u0 = dx * doY - dy * doX;
        let u1 = dx * dtY - dy * dtX;
        if (denom == 0) {
            if (u0 == 0 && u1 == 0) {
                return LineClassification.Collinear;
            } else {
                return LineClassification.Paralell;
            }
        } else {
            u0 = u0 / denom;
            u1 = u1 / denom;
            let x = pAX + u0 * dtX;
            let y = pAY + u0 * dtY;
            if (intersectPoint) {
                intersectPoint.x = x;
                intersectPoint.y = y;
            }
            if ((u0 >= 0) && (u0 <= 1) && (u1 >= 0) && (u1 <= 1)) {
                return LineClassification.SegmentsIntersect;
            }
            else if ((u1 >= 0) && (u1 <= 1)) {
                return (LineClassification.ABisectB);
            }
            else if ((u0 >= 0) && (u0 <= 1)) {
                return (LineClassification.BBisectA);
            }
            return LineClassification.LinesIntersect;
        }
    }

    equals(line: Line) {
        const { pA, pB } = this;
        const { pA: lpA, pB: lpB } = line;
        return equals(pA, lpA) && equals(pB, lpB) || equals(pA, lpB) && equals(pB, lpA);
    }
}