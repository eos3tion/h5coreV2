import { ThrowError } from "../debug/ThrowError";
import { zeroize } from "../utils/StringUtils";

export class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r = 1, g = 1, b = 1, a = 1) {
        this.set(r, g, b, a);
    }

    set(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        return this;
    }

    setHex(argbColor: number) {
        return this.set(
            ((argbColor >> 16) & 255) / 255,
            ((argbColor >> 8) & 255) / 255,
            (argbColor & 255) / 255,
            ((argbColor >> 24) & 255) / 255
        )
    }

    copyFrom(color: Color) {
        return this.set(color.r, color.g, color.b, color.a);
    }

    concat(color: Color) {
        this.r *= color.r;
        this.g *= color.g;
        this.b *= color.b;
        this.a *= color.a;
        return this;
    }

    prepend(color: Color) {
        return this.concat(color);
    }

    color() {
        return new Color(this.r, this.g, this.b, this.a);
    }
}

/**
 * 获取颜色字符串 #a1b2c3
 * @param c
 * @return 获取颜色字符串 #a1b2c3
 *
 */
export function getColorString(c: number) {
    return "#" + zeroize(c.toString(16), 6);
}

/**
 * 将#a1b2c3这样#开头的颜色字符串，转换成颜色数值
 */
export function getColorValue(c: string) {
    if (/#[0-9a-f]{6}/i.test(c)) {
        return +("0x" + c.substring(1));
    } else {
        if (DEBUG) {
            ThrowError(`使用的颜色${c}有误`);
        }
        return 0;
    }
}