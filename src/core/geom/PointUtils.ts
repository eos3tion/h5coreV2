export function subtract(pB: Point, pA: Point, out?: Point) {
    out = out || {} as Point;
    out.x = pB.x - pA.x;
    out.y = pB.y - pA.y;
    return out;
}

export function getLength({ x, y }: Point) {
    return Math.sqrt(x * x + y * y);
}

export function normalize(pt: Point, thickness = 1) {
    if (pt.x != 0 || pt.y != 0) {
        let relativeThickness = thickness / getLength(pt);
        pt.x *= relativeThickness;
        pt.y *= relativeThickness;
    }
    return pt;
}

export function getDirection(pA: Point, pB: Point, out?: Point) {
    let pt = subtract(pB, pA);
    return normalize(pt);
}

export function dot(pA: Point, pB: Point) {
    return pA.x * pB.x + pA.y * pB.y;
}

export function copy(from: Point, to: Point) {
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
export function epsilonEquals(pA: Point, pB: Point, epsilon = 1e-6) {
    return getLength(subtract(pA, pB)) < epsilon
}

/**
 * 判断pA坐标是否和pB坐标一致
 * @param pA 
 * @param pB 
 */
export function equals(pA: Point, pB: Point) {
    return pA.x == pB.x && pA.y == pB.y;
}