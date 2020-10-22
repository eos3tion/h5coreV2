import { Noop } from "../../../../core/constants/Shared";
import { MapInfo, regMapPosSolver, MapPathType, MapPosSolver } from "../../MapInfo";

export interface GridMapInfo extends MapInfo {
    /**
     * 路径点数据
     */
    pathdata: Uint8Array;
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
}


const poses = [
        /*↓*/[0, 1],
        /*↘*/[1, 1],
        /*→*/[1, 0],
        /*↗*/[1, -1],
        /*↑*/[0, -1],
        /*↖*/[-1, -1],
        /*←*/[-1, 0],
        /*↙*/[-1, 1]
]
export type initGridMapHandler = { (map: GridMapInfo): void };

let init: initGridMapHandler = Noop;

export function setInit(handler: initGridMapHandler) {
    init = handler;
}

regMapPosSolver(MapPathType.Grid, {
    init(map) {
        init(map);
    },
    map2Screen(x, y, isCenter?: boolean) {
        const { gridWidth, gridHeight } = this;
        let hw = gridWidth >> 1;
        let hh = gridHeight >> 1;
        x = x * gridWidth;
        y = y * gridHeight;
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
        return {
            x: Math.round(x / this.gridWidth),
            y: Math.round(y / this.gridHeight)
        }
    },
    getFacePos(x: number, y: number, face8: number) {
        let pos = poses[face8];
        return {
            x: x + pos[0],
            y: y + pos[1]
        }
    }
} as MapPosSolver<GridMapInfo>)