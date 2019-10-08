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