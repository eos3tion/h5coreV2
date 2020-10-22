export function subtract(pB: Point2, pA: Point2, out?: Point2) {
    out = out || {} as Point2;
    out.x = pB.x - pA.x;
    out.y = pB.y - pA.y;
    return out;
}

export function getLength({ x, y }: Point2) {
    return Math.sqrt(x * x + y * y);
}

export function normalize(pt: Point2, thickness = 1) {
    if (pt.x != 0 || pt.y != 0) {
        let relativeThickness = thickness / getLength(pt);
        pt.x *= relativeThickness;
        pt.y *= relativeThickness;
    }
    return pt;
}

export function getDirection(pA: Point2, pB: Point2, out?: Point2) {
    let pt = subtract(pB, pA, out);
    return normalize(pt);
}

export function dot(pA: Point2, pB: Point2) {
    return pA.x * pB.x + pA.y * pB.y;
}

export function copy(from: Point2, to: Point2) {
    to.x = from.x;
    to.y = from.y;
    return to;
}

/**
 * 判断pA和pB的坐标是否在精度范围内一致
 * @param pA 
 * @param pB 
 * @param epsilon 
 */
export function epsilonEquals(pA: Point2, pB: Point2, epsilon = 1e-6) {
    return getLength(subtract(pA, pB)) < epsilon
}

/**
 * 判断pA坐标是否和pB坐标一致
 * @param pA 
 * @param pB 
 */
export function equals(pA: Point2, pB: Point2) {
    return pA.x == pB.x && pA.y == pB.y;
}


/**
 * 两点间的距离平方，用于比较距离
 * @param param0 点1
 * @param param1 点2
 * @param ratio 宽高比，y方向会乘以ratio，默认为`1`
 */
export function sqDist2({ x: xA, y: yA }: Point2, { x: xB, y: yB }: Point2, ratio = 1) {
    const dx = xA - xB;
    const dy = (yA - yB) * ratio;
    return dx * dx + dy * dy;
}

/**
 * 
 * @param a 
 * @param b 
 * @param ratio 
 */
export function dist2(a: Point2, b: Point2, ratio = 1) {
    return sqDist2(a, b, ratio);
}

/**
 * 确定两个指定点之间的点
 * 参数 f 确定新的内插点相对于参数 pt1 和 pt2 指定的两个端点所处的位置。参数 f 的值越接近 1.0，则内插点就越接近第一个点（参数 pt1）。参数 f 的值越接近 0，则内插点就越接近第二个点（参数 pt2）
 * @param pt1 
 * @param pt2 
 * @param f 两个点之间的内插级别。表示新点将位于 pt1 和 pt2 连成的直线上的什么位置。如果 f=1，则返回 pt1；如果 f=0，则返回 pt2
 * @param result 返回的点
 */
export function interpolate(pt1: Point2, pt2: Point2, f: number, result?: Point2) {
    let f1 = 1 - f;
    result = result || {} as Point2;
    result.x = pt1.x * f + pt2.x * f1;
    result.y = pt1.y * f + pt2.y * f1;
    return result;
}

export function getNewPoint2(x = 0, y = 0) {
    return { x, y };
}