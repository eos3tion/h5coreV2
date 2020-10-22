import { Polygon } from "../../../../core/geom/Polygon";
import { MapInfo } from "../../MapInfo";
import { Cell } from "./Cell";
export interface MapMaskInfo {
    poly: Polygon;
    data?: number;
}

export interface NavMeshMapInfo extends MapInfo {
    /**
     * 网格是否链接过
     */
    linked: boolean;
    /**
     * 可走格位
     */
    cells: Cell[];

    /**
     * 不可走区域的多边形
     */
    polys: Polygon[];

    /**
     * 遮罩数据列表
     */
    masks?: MapMaskInfo[];
}
