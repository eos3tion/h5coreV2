/**
 * 获取坐标点的hash值
 * 
 * @export
 * @param {Point} pos 
 * @returns 
 */
export function getPosHash(pos: Point2) {
    return pos.x << 16 | (pos.y & 0xffff)
}

export function getPosHash2(x: number, y: number) {
    return x << 16 | (y & 0xffff);
}
