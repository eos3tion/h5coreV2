import { clamp, Deg2Rad } from "../../core/utils/Math";

const lR = 0.213;
const lG = 0.715;
const lB = 0.072;

const adjustColorFilters: { [key: string]: egret.ColorMatrixFilter } = {}


function adjustHue(value: number) {
    // convert to radians.
    let v = value * Deg2Rad;
    let cv = Math.cos(v);
    let sv = Math.sin(v);

    return [lR + (cv * (1 - lR)) + (sv * -lR), lG + (cv * -lG) + (sv * -lG), lB + (cv * -lB) + (sv * (1 - lB)), 0, 0,
    lR + (cv * -lR) + (sv * 0.143), lG + (cv * (1 - lG)) + (sv * 0.140), lB + (cv * -lB) + (sv * -0.283), 0, 0,
    lR + (cv * -lR) + (sv * -(1 - lR)), lG + (cv * -lG) + (sv * lG), lB + (cv * (1 - lB)) + (sv * lB), 0, 0,
        0, 0, 0, 1, 0];
}

function adjustSaturation(value: number) {
    value *= .01;

    let v = value + 1;
    let i = (1 - v);
    let r = (i * lR);
    let g = (i * lG);
    let b = (i * lB);

    return [r + v, g, b, 0, 0,
        r, g + v, b, 0, 0,
        r, g, b + v, 0, 0,
        0, 0, 0, 1, 0];
}

/* value = -1 to 1 */
function adjustContrast(value: number) {
    value *= .01;

    let v = value + 1;
    let o = 128 * (1 - v);

    return [v, 0, 0, 0, o,
        0, v, 0, 0, o,
        0, 0, v, 0, o,
        0, 0, 0, v, 0];

}

/* value = -1 to 1 */
function adjustBrightness(value: number) {
    let v = 2.55 * value;
    return [1, 0, 0, 0, v,
        0, 1, 0, 0, v,
        0, 0, 1, 0, v,
        0, 0, 0, 1, 0];
}

// multiplies one matrix against another:
function multiplyMatrix(TargetMatrix: number[], MultiplyMatrix: number[]) {
    let col: number[] = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 5; j++) {
            col[j] = TargetMatrix[j + (i * 5)];
        }
        for (let j = 0; j < 5; j++) {
            var val = 0;
            for (let k = 0; k < 4; k++) {
                val += MultiplyMatrix[j + (k * 5)] * col[k];
            }
            TargetMatrix[j + (i * 5)] = val;
        }
    }
}

export function adjustColorFilter(brightness?: number, contrast?: number, saturation?: number, hue?: number) {

    hue = hue | 0;
    saturation = saturation | 0;
    brightness = brightness | 0;
    contrast = contrast | 0;
    if (hue) {
        hue = clamp(hue, -180, 180);
    }
    if (saturation) {
        saturation = clamp(saturation, -100, 100);
    }
    if (brightness) {
        brightness = clamp(brightness, -100, 100);
    }
    if (contrast) {
        contrast = clamp(contrast, -100, 100);
    }
    let key = brightness + contrast * 1E3 + saturation * 1E6 + hue * 1E9;
    let filter = adjustColorFilters[key];
    if (!filter) {
        let vec = [1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, 1, 0];
        if (hue) {
            multiplyMatrix(vec, adjustHue(hue));
        }
        if (saturation) {
            multiplyMatrix(vec, adjustSaturation(saturation));
        }
        if (brightness) {
            multiplyMatrix(vec, adjustBrightness(brightness));
        }
        if (contrast) {
            multiplyMatrix(vec, adjustContrast(contrast));
        }
        adjustColorFilters[key] = filter = new egret.ColorMatrixFilter(vec);
    }
    return filter;
}

/**
 * 默认的变灰
 */
export const GrayFilters = [new egret.ColorMatrixFilter([0.3086, 0.6094, 0.0820, 0, 0, 0.3086, 0.6094, 0.0820, 0, 0, 0.3086, 0.6094, 0.0820, 0, 0, 0, 0, 0, 1, 0])];

/**
 * 默认的模糊
 */
export const BlurFilters = [new egret.BlurFilter(5, 5)]