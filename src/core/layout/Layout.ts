import { MustReplace } from "../constants/Shared";

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
export interface LayoutDisplay {
    width?: number;
    height?: number;

    x?: number;
    y?: number;

    parent?: LayoutDisplayParent;

    $layoutSize?: Size;

    display?: ViewDele;
}
export interface LayoutDisplayParent extends Size { };


/**
 * 基于Point位置的布局方式，进行布局
 * 
 * @param {number} disWidth 
 * @param {number} disHeight 
 * @param {number} parentWidth 
 * @param {number} parentHeight 
 * @param {Point2} point 
 * @param {Point2} [result] 
 * @param {number} [padx=0] 
 * @param {number} [pady=0] 
 * @returns 
 */
function getTipLayoutPos(disWidth: number, disHeight: number, parentWidth: number, parentHeight: number, point: Point2, result?: Point2, padx = 0, pady = 0) {
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
    result.x = Math.round(x);
    result.y = Math.round(y);
    return result;
}

function getPos(disWidth: number, disHeight: number, parentWidth: number, parentHeight: number, layout: LayoutType, result?: Point2, hoffset = 0, voffset = 0, outerV?: boolean, outerH?: boolean) {
    result = result || {} as Point2;
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
    result.x = Math.round(x + hoffset);
    result.y = Math.round(y + voffset);
    return result;
}
export const getLayoutPos = getPos;
export interface LayoutParam {
    disWidth: number;
    disHeight: number;
    display: Point2;
    parentWidth: number;
    parentHeight: number;
}

type getLayoutParamHandler = (out: LayoutParam, dis: LayoutDisplay, parent?: LayoutDisplayParent) => void

let getLayoutParam: getLayoutParamHandler = MustReplace(`获取LayoutParam的数组`);

const result = { disWidth: 0, disHeight: 0, display: null, parentWidth: 0, parentHeight: 0 } as LayoutParam;
export function setLayoutParamHandler(handler: getLayoutParamHandler) {
    getLayoutParam = handler;
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
/**
 *
 * @author 3tion
 *
 */
export const Layout = {

    /**
     * 对DisplayObject，基于父级进行排布
     * 
     * @static
     * @param {LayoutDisplay} dis 要布局的可视对象
     * @param {LayoutType} layout 布局方式
     * @param {number} [hoffset=0] 在原布局基础上，水平方向的再偏移量（内部运算是"+",向左传负）
     * @param {number} [voffset=0] 在原布局基础上，垂直方向的再偏移量（内部运算是"+",向上传负）
     * @param {boolean} [outerV=false] 垂直方向上基于父级内部
     * @param {boolean} [outerH=false] 水平方向上基于父级内部
     * @param {LayoutDisplayParent} [parent] 父级容器，默认取可视对象的父级
     */
    layout(dis: LayoutDisplay, layout: LayoutType, hoffset?: number, voffset?: number, outerV?: boolean, outerH?: boolean, parent?: LayoutDisplayParent) {
        getLayoutParam(result, dis, parent);
        if (!result) return;
        let { disWidth, disHeight, display, parentWidth, parentHeight } = result;
        getPos(disWidth, disHeight, parentWidth, parentHeight, layout, display, hoffset, voffset, outerV, outerH);
    },

    /**
     * 基于百分比进行布局
     * 
     * @param {LayoutDisplay} dis 
     * @param {number} [top=0] 百分比数值 `0.2` dis的顶距游戏边界顶部 20%
     * @param {number} [left=0] 百分比数值 `0.2` dis的左边缘距游戏左边缘 20%
     * @param {LayoutDisplayParent} [parent] 父级容器，默认取可视对象的父级
     * @param {number} [padx=0] 
     * @param {number} [pady=0] 
     * @returns 
     */
    layoutPercent(dis: LayoutDisplay, top = 0, left = 0, parent?: LayoutDisplayParent, padx = 0, pady = 0) {
        getLayoutParam(result, dis, parent);
        if (!result) return;
        let { disWidth, disHeight, display, parentWidth, parentHeight } = result;
        display.x = Math.round((parentWidth - disWidth) * left + padx);
        display.y = Math.round((parentHeight - disHeight) * top + pady);
        return display;
    },
    /**
     * 基于鼠标位置的tip的布局方式
     * 
     * @param {LayoutDisplay} dis 要被布局的可视对象
     * @param {Point2} point 传入的点
     * @param {{ x: number, y: number }} [result] 
     * @param {number} [padx=0] 间隔x
     * @param {number} [pady=0] 间隔y
     * @param {LayoutDisplayParent} [parent] 容器的大小
     */
    tipLayout(layoutDis: LayoutDisplay, point: Point2, padx?: number, pady?: number, parent?: LayoutDisplayParent) {
        getLayoutParam(result, layoutDis, parent);
        if (!result) return;
        let { disWidth, disHeight, display, parentWidth, parentHeight } = result;
        getTipLayoutPos(disWidth, disHeight, parentWidth, parentHeight, point, display, padx, pady);
    },

    /**
     * 基于point位置的布局方式，进行布局
     * 
     * @param {number} disWidth 
     * @param {number} disHeight 
     * @param {number} parentWidth 
     * @param {number} parentHeight 
     * @param {Point2} point 基准点位置
     * @param {Point2} [result] 
     * @param {number} [padx=0] 偏移X
     * @param {number} [pady=0] 偏移Y
     * @returns 
     */
    getTipLayoutPos,
    /**
     * 用于统一存储狗屎异形屏的UI偏移量数据  
     */
    offsets: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    }
}
