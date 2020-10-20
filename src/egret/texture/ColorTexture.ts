import { getColorString } from "../../core/data/Color";
import { getTextureSheet } from "./TextureSheet";

let idx = 0;
let increaseCount = 5;
let size = Math.pow(2, increaseCount);

let sheet = getTextureSheet(size << 2);

function checkCanvas() {
    if (idx >= size * size) {
        size <<= 1;
        sheet.extSize(size << 2);
        increaseCount++;
    }
}

/**
 * ```
 * ┌─┬─┐
 * │0│1│
 * ├─┼─┤
 * │2│3│
 * └─┴─┘
 * ```
 */
const poses = [
        /**0 */[0, 0],
        /**1 */[1, 0],
        /**2 */[0, 1],
        /**3 */[1, 1]
]



/**
 * 获取一个纯色的纹理
 */
export function getTexture(color = 0, alpha = 1) {
    let key = color + "_" + alpha;
    let tex = sheet.get(key);
    if (!tex) {
        checkCanvas();
        let count = increaseCount;
        let x = 0, y = 0;
        let cidx = idx;
        do {
            let shift = 2 * count;
            let area = cidx >> shift;
            cidx = cidx - (area << shift);
            let pos = poses[area];
            let pp = 2 << (shift / 2 - 1);
            x += pos[0] * pp;
            y += pos[1] * pp;
            if (!--count) {
                let pos = poses[cidx];
                x += pos[0];
                y += pos[1];
                break
            }
        } while (true)
        let ctx = sheet.ctx;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = getColorString(color);
        x <<= 2;
        y <<= 2;
        ctx.fillRect(x, y, 4, 4);
        const ww = 2;
        tex = sheet.reg(key, { x: x + 1, y: y + 1, width: ww, height: ww });
        if (tex) {
            idx++;
        }
    }
    return tex;
}

export const ErrorTexture = getTexture(0xff0000);