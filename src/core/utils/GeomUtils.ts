/**
 * 检查`p`是否在`p1`->`p2`连成的线段左边
 * @param p1 
 * @param p2 
 * @param p 
 */
export function isLeft(p1: Point, p2: Point, p: Point) {
    let { x, y } = p;
    return (p1.x - x) * (p2.y - y) < (p2.x - x) * (p1.y - y);
}

/**
 * 检查`main`Rect是否包含`tester`
 * @param main 
 * @param tester 
 */
export function containsRect(main: Rect, tester: Rect) {
    let r1 = tester.x + tester.width;
    let b1 = tester.y + tester.height;
    let r2 = main.x + main.width;
    let b2 = main.y + main.height;
    return (tester.x >= main.x) && (tester.x < r2) && (tester.y >= main.y) && (tester.y < b2) && (r1 > main.x) && (r1 <= r2) && (b1 > main.y) && (b1 <= b2);
}

/**
 * 获取多个点的几何中心点
 * 
 * @export
 * @param points 点集
 * @param result 结果
 * @returns 点集的几何中心点
 */
export function getCenter(points: Point[], result?: Point) {
    result = result || {} as Point;
    let len = points.length;
    let x = 0;
    let y = 0;
    for (let i = 0; i < len; i++) {
        let point = points[i];
        x += point.x;
        y += point.y;
    }
    result.x = x / len;
    result.y = y / len;
    return result;
}

/**
 * 检查类矩形 a 和 b 是否相交
 * @export
 * @param {Rect} a   类矩形a
 * @param {Rect} b   类矩形b
 * @returns {boolean} true     表示两个类似矩形的物体相交  
 *                    false    表示两个类似矩形的物体不相交
 */
export function intersects(a: Rect, b: Rect): boolean {
    let aright = a.x + a.width;
    let abottom = a.y + a.height;
    let bright = b.x + b.width;
    let bbottom = b.y + b.height;
    return Math.max(a.x, b.x) <= Math.min(aright, bright)
        && Math.max(a.y, b.y) <= Math.min(abottom, bbottom);
}

/**
 * 获取点集围成的区域的面积
 * S=（（X2-X1）*  (Y2+Y1)+（X2-X2）*  (Y3+Y2)+（X4-X3）*  (Y4+Y3)+……+（Xn-Xn-1）*  (Yn+Yn-1)+（X1-Xn）*  (Y1+Yn)）/2
 * @export
 * @param {Point[]} points 点集
 * @returns {number}
 */
export function getArea(points: Point[]) {
    let p0 = points[0];
    let s = 0;
    let last = p0;
    for (let i = 1, length = points.length; i < length; i++) {
        let p = points[i];
        s += (p.x - last.x) * (p.y + last.y);
        last = p;
    }
    s += (p0.x - last.x) * (p0.y + last.y);
    return s * .5;
}