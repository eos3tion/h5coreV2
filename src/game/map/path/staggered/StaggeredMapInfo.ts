import { Noop } from "../../../../core/constants/Shared";
import { Polygon } from "../../../../core/geom/Polygon";
import { MapInfo, regMapPosSolver, MapPathType, MapPosSolver } from "../../MapInfo";

export interface StaggeredMapInfo extends MapInfo {

    pathdata: Uint8Array;

    /**
     * 路径数据最大支持的位数
     */
    pdatabit: number;

    /**
     * 透明区域点数据
     */
    adata?: Uint8Array;

    /**
     * 格子宽度
     */
    gridWidth: number;

    /**
     * 格子高度
     */
    gridHeight: number;

    /**
     * 地图格子列数
     */
    columns: number;

    /**
     * 地图格子行数
     */
    rows: number;

    /**
     * 算格子用多边形
     */
    polygon: Polygon;

    /**
     * 格子高度的一半
     */
    hh: number;
    /**
     * 格子宽度的一半
     */
    hw: number;

    /**
     * 此方法在执行过`bindMapPos`后生效  
     * 地图坐标转换为屏幕坐标
     * @param x 
     * @param y 
     */
    map2Screen?(x: number, y: number, isCenter?: boolean): Point2;
}

const posesOdd = [
        /* ↓  */[0, 2],
        /* ↘ */[1, 1],
        /* →  */[1, 0],
        /* ↗ */[1, -1],
        /* ↑  */[0, -2],
        /* ↖ */[0, -1],
        /* ←  */[-1, 0],
        /* ↙ */[0, 1]
]

const posesEven = [
        /* ↓  */[0, 2],
        /* ↘ */[0, 1],
        /* →  */[1, 0],
        /* ↗ */[0, -1],
        /* ↑  */[0, -2],
        /* ↖ */[-1, -1],
        /* ←  */[-1, 0],
        /* ↙ */[-1, 1]
]

export type initStaggeredMapHandler = { (map: StaggeredMapInfo): void };

let init: initStaggeredMapHandler = Noop;

export function setInit(handler: initStaggeredMapHandler) {
    init = handler;
}

regMapPosSolver(MapPathType.Staggered, {
    init(map) {
        init(map);
        let polygon = new Polygon();
        map.polygon = polygon;
        const { gridWidth, gridHeight } = map;
        let hh = gridHeight >> 1;
        let hw = gridWidth >> 1;
        map.hh = hh;
        map.hw = hw;
        polygon.points = [{ x: hw, y: 0 }, { x: gridWidth, y: hh }, { x: hw, y: gridHeight }, { x: 0, y: hh }]
    },
    map2Screen(i, j, isCenter?: boolean) {
        const { gridWidth, hw, hh } = this;
        let x = i * gridWidth;
        if (j & 1) {
            x += hw;
        }
        let y = j * hh;
        if (isCenter) {
            x += hw;
            y += hh;
        }
        return {
            x,
            y,
        }
    },
    screen2Map(x, y) {
        const { gridHeight, gridWidth, hw, hh } = this;
        let i = x / gridWidth >> 0;
        let j = y / gridHeight >> 0;

        //得到格子所在区域
        let dx = x - i * gridWidth;
        let dy = y - j * gridHeight;
        j *= 2;
        if (!this.polygon.containPos(dx, dy)) {//不在格子内
            //检查坐标所在区域
            //   左上  右上   
            //   左下  右下
            if (dx < hw) {
                i--;
            }
            if (dy < hh) {//左上
                j--;
            } else {//左下
                j++;
            }
        }

        return { x: i, y: j };
    },
    /**
     * 根据当前坐标相邻的指定朝向对应的坐标
     * @param x 
     * @param y 
     * @param face8 0 ↓  
     *              1 ↘  
     *              2 →  
     *              3 ↗  
     *              4 ↑  
     *              5 ↖  
     *              6 ←  
     *              7 ↙
     */
    getFacePos(x: number, y: number, face8: number) {
        const poses = y & 1 ? posesOdd : posesEven
        const [ox, oy] = poses[face8];
        return {
            x: x + ox,
            y: y + oy
        }
    }
} as MapPosSolver<StaggeredMapInfo>)
