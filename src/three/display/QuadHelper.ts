import { Vector2 } from "../../../node_modules/three/src/math/Vector2";
import { Matrix } from "../../core/data/Matrix";
import { Color } from "../../core/data/Color";

export const enum QuadConst {
    TraingleCount = 2,
    VectorCount = TraingleCount * 3,

    PositionSize = 2,

    PositionCount = PositionSize * VectorCount,

    ColorSize = 4,

    ColorCount = ColorSize * VectorCount,

    UVSize = 2,

    UVCount = UVSize * VectorCount,

    ExpandMultiple = 2,
}

export interface QuadPositions {
    /**
     * 左上
     */
    v1: Vector2;
    /**
     * 右上
     */
    v2: Vector2;
    /**
     * 右下
     */
    v3: Vector2;
    /**
     * 左下
     */
    v4: Vector2;
}

export function solvePositions(offset: number, positions: Float32Array, q: QuadPositions, modelViewMatrix: Matrix) {
    const { a: mat_a, b: mat_b, c: mat_c, d: mat_d, tx: mat_tx, ty: mat_ty } = modelViewMatrix;
    const {
        v1: { x: v1_x, y: v1_y },
        v2: { x: v2_x, y: v2_y },
        v3: { x: v3_x, y: v3_y },
        v4: { x: v4_x, y: v4_y },
    } = q;
    positions[offset + 0] = positions[offset + 6] = v1_x * mat_a + v1_y * mat_c + mat_tx;
    positions[offset + 1] = positions[offset + 7] = v1_x * mat_b + v1_y * mat_d + mat_ty;
    positions[offset + 2] = positions[offset + 10] = v3_x * mat_a + v3_y * mat_c + mat_tx;
    positions[offset + 3] = positions[offset + 11] = v3_x * mat_b + v3_y * mat_d + mat_ty;
    positions[offset + 4] = v2_x * mat_a + v2_y * mat_c + mat_tx;
    positions[offset + 5] = v2_x * mat_b + v2_y * mat_d + mat_ty;
    positions[offset + 8] = v4_x * mat_a + v4_y * mat_c + mat_tx;
    positions[offset + 9] = v4_x * mat_b + v4_y * mat_d + mat_ty;
}



export interface QuadColors {
    c1: Color;
    c2: Color;
    c3: Color;
    c4: Color;
}

export function solveColors(offset: number, colors: Float32Array, q: QuadColors, color: Color) {
    const {
        c1: { a: c1_a, r: c1_r, g: c1_g, b: c1_b },
        c2: { a: c2_a, r: c2_r, g: c2_g, b: c2_b },
        c3: { a: c3_a, r: c3_r, g: c3_g, b: c3_b },
        c4: { a: c4_a, r: c4_r, g: c4_g, b: c4_b },
    } = q;
    const { a: color_a, r: color_r, g: color_g, b: color_b } = color;

    colors[offset + 0] = colors[offset + 12] = c1_r * color_r;
    colors[offset + 1] = colors[offset + 13] = c1_g * color_g;
    colors[offset + 2] = colors[offset + 14] = c1_b * color_b;
    colors[offset + 3] = colors[offset + 15] = c1_a * color_a;
    colors[offset + 4] = colors[offset + 20] = c3_r * color_r;
    colors[offset + 5] = colors[offset + 21] = c3_g * color_g;
    colors[offset + 6] = colors[offset + 22] = c3_b * color_b;
    colors[offset + 7] = colors[offset + 23] = c3_a * color_a;
    colors[offset + 8] = c2_r * color_r;
    colors[offset + 9] = c2_g * color_g;
    colors[offset + 10] = c2_b * color_b;
    colors[offset + 11] = c2_a * color_a;
    colors[offset + 16] = c4_r * color_r;
    colors[offset + 17] = c4_g * color_g;
    colors[offset + 18] = c4_b * color_b;
    colors[offset + 19] = c4_a * color_a;
}

export interface QuadUvs {
    uv1: Vector2;
    uv2: Vector2;
    uv3: Vector2;
    uv4: Vector2;
}

export function solveUvs(offset: number, uvs: Float32Array, q: QuadUvs) {
    const {
        uv1,
        uv2,
        uv3,
        uv4
    } = q;

    uvs[offset + 0] = uvs[offset + 6] = uv1.x;
    uvs[offset + 1] = uvs[offset + 7] = uv1.y;
    uvs[offset + 2] = uvs[offset + 10] = uv3.x;
    uvs[offset + 3] = uvs[offset + 11] = uv3.y;
    uvs[offset + 4] = uv2.x;
    uvs[offset + 5] = uv2.y;
    uvs[offset + 8] = uv4.x;
    uvs[offset + 9] = uv4.y;
}