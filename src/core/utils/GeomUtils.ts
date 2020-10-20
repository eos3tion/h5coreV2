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