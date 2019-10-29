const { round } = Math;

export const enum LayoutType {
    /**
     * 全屏
     */
    FullScreen = 0,
    /**
     * 垂直——上
     * 
     * @static
     * @type {number}
     */
    TOP = 0b0100,
    /**
     * 垂直——中
     * 
     * @static
     * @type {number}
     */
    MIDDLE = 0b1000,

    /**
     * 垂直——下
     * 
     * @static
     * @type {number}
     */
    BOTTOM = 0b1100,

    /**
     * 水平——左
     * 
     * @static
     * @type {number}
     */
    LEFT = 0b01,

    /**
     * 水平——中
     * 
     * @static
     * @type {number}
     */
    CENTER = 0b10,

    /**
     * 水平——右
     * 
     * @static
     * @type {number}
     */
    RIGHT = 0b11,

    /**
     * 垂直方向的位运算mask
     * 
     * @static
     * @type {number}
     */
    VERTICAL_MASK = 0b1100,

    /**
     * 水平方向位运算mask
     * 
     * @static
     * @type {number}
     */
    HORIZON_MASK = 0b11,

    /**
     * 左上
     */
    TOP_LEFT = TOP | LEFT,

    /**
     * 中上
     */
    TOP_CENTER = TOP | CENTER,

    /**
     * 右上
     */
    TOP_RIGHT = TOP | RIGHT,

    /**
     * 左中
     */
    MIDDLE_LEFT = MIDDLE | LEFT,

    /**
     * 中心
     */
    MIDDLE_CENTER = MIDDLE | CENTER,

    /**
     * 右中
     */
    MIDDLE_RIGHT = MIDDLE | RIGHT,

    /**
     * 左下
     */
    BOTTOM_LEFT = BOTTOM | LEFT,

    /**
     * 中下
     */
    BOTTOM_CENTER = BOTTOM | CENTER,

    /**
     * 右下
     */
    BOTTOM_RIGHT = BOTTOM | RIGHT
}

export const enum LayoutTypeVertical {
    TOP = LayoutType.TOP,
    MIDDLE = LayoutType.MIDDLE,
    BOTTOM = LayoutType.BOTTOM
}
export const enum LayoutTypeHorizon {
    LEFT = LayoutType.LEFT,
    CENTER = LayoutType.CENTER,
    RIGHT = LayoutType.RIGHT
}


/**
 * 基于Point位置的布局方式，进行布局
 * 
 * @param {number} disWidth 
 * @param {number} disHeight 
 * @param {number} parentWidth 
 * @param {number} parentHeight 
 * @param {Point} point 
 * @param {Point} [result] 
 * @param {number} [padx=0] 
 * @param {number} [pady=0] 
 * @returns 
 */
export function getTipLayoutPos(disWidth: number, disHeight: number, parentWidth: number, parentHeight: number, point: Point, result?: Point, padx = 0, pady = 0) {
    let mx = point.x;
    let my = point.y;
    let x = mx + padx;
    let y = my + pady;
    if (disWidth + x + padx > parentWidth) {
        x = parentWidth - disWidth - padx;
        if (x < mx) {
            x = mx - disWidth - padx;
        }
        if (x < 0) {
            x = padx;
        }
    }
    if (disHeight + my + pady > parentHeight) {
        y = parentHeight - disHeight - pady;
        if (y < 0) {
            y = pady;
        }
    }
    result.x = round(x);
    result.y = round(y);
    return result;
}

export function getLayoutPos(disWidth: number, disHeight: number, parentWidth: number, parentHeight: number, layout: LayoutType, result?: Point, hoffset = 0, voffset = 0, outerV?: boolean, outerH?: boolean) {
    result = result || {} as Point;
    let vertical = layout & LayoutType.VERTICAL_MASK;
    let horizon = layout & LayoutType.HORIZON_MASK;
    let y = 0, x = 0;
    switch (vertical) {
        case LayoutType.TOP:
            if (outerV) {
                y = -disHeight;
            }
            break;
        case LayoutType.MIDDLE: // 不支持非innerV
            y = parentHeight - disHeight >> 1;
            break;
        case LayoutType.BOTTOM:
            if (outerV) {
                y = parentHeight;
            } else {
                y = parentHeight - disHeight;
            }
            break;
    }
    switch (horizon) {
        case LayoutType.LEFT:
            if (outerH) {
                x = -disWidth;
            }
            break;
        case LayoutType.CENTER: // 不支持非innerH
            x = parentWidth - disWidth >> 1;
            break;
        case LayoutType.RIGHT:
            if (outerH) {
                x = parentWidth;
            } else {
                x = parentWidth - disWidth;
            }
            break;
    }
    result.x = round(x + hoffset);
    result.y = round(y + voffset);
    return result;
}

/**
 * 用于统一存储狗屎异形屏的UI偏移量数据  
 */
export const offsets = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
}

/**
 * @param sw 父级宽度
 * @param sh 父级高度
 * @param bw 要调整的可视对象宽度
 * @param bh 要调整的可视对象高度
 * @param {boolean} [isWide=false] fixedNarrow 还是 fixedWide，默认按fixedNarrow布局
 */
export function getFixedLayout(sw: number, sh: number, bw: number, bh: number, isWide?: boolean) {
    let dw = sw, dh = sh;
    let scaleX = sw / bw;
    let scaleY = sh / bh;
    let lw = bw;
    let lh = bh;
    let scale: number;
    if (scaleX < scaleY == !isWide) {
        scale = scaleX;
        dh = scaleX * bh;
        lh = bh * sh / dh;
    } else {
        scale = scaleY;
        dw = scaleY * bw;
        lw = bw * sw / dw;
    }
    return { dw, dh, scale, lw, lh };
}