import { getColorString } from "../../../../core/data/Color";
import { MapPathType, bindMapPos } from "../../../../game/map/MapInfo";
import { GridMapInfo, setInit } from "../../../../game/map/path/grid/GridMapInfo";
import { removeDisplay } from "../../../sui/EgretExtend";
import { getDynamicTexSheet } from "../../../texture/DynamicTextureSheet";
import { TileMapLayer } from "../tilemap/TileMapLayer";

interface GridPathDraw {
    /**
     * Debug专用
     */
    debugGridPanes?: egret.Bitmap[];

}

if (DEBUG) {

    const sheets = getDynamicTexSheet();

    var getTexture = function (gridWidth: number, gridHeight: number, level: number) {
        let showLevel = level > 1;
        let color = level ? 0xcccc : 0xcc3333;
        return $getTexture(gridWidth, gridHeight, color, level, showLevel);

        function $getTexture(gridWidth: number, gridHeight: number, color: number, level: number, showLevel?: boolean) {
            let key = gridWidth + "_" + gridHeight + "_" + color + "_" + level + "_" + showLevel;
            let tex = sheets.get(key);
            if (!tex) {
                let hw = gridWidth >> 1;
                let hh = gridHeight >> 1;
                let canvas = document.createElement("canvas");
                canvas.width = gridWidth;
                canvas.height = gridHeight;
                let g = canvas.getContext("2d");
                let c = getColorString(color);
                g.strokeStyle = c;
                g.fillStyle = c;
                g.beginPath();
                g.moveTo(0, 0);
                g.lineTo(gridWidth, 0);
                g.lineTo(gridWidth, gridHeight);
                g.lineTo(0, gridHeight);
                g.lineTo(0, 0);
                g.closePath();
                g.stroke();
                g.globalAlpha = 0.1;
                g.fill();
                if (showLevel) {
                    g.globalAlpha = 1;
                    g.fillStyle = "#ffffff";
                    g.font = `normal normal 10px arial`;
                    g.textBaseline = "middle";
                    let l = level + "";
                    let textHalfWidth = g.measureText(l).width >> 1;
                    let x = hw - textHalfWidth;
                    g.strokeStyle = "#000000";
                    g.strokeText(l, x, hh, gridWidth);
                    g.fillText(l, x, hh, gridWidth);
                }
                let tex = new egret.Texture();
                tex.bitmapData = new egret.BitmapData(canvas);
                sheets.bindOrUpdate(key, tex);
            }
            return tex;
        }
    }

    $gm.regPathDraw(MapPathType.Grid,
        function (this: TileMapLayer & GridPathDraw, x: number, y: number, w: number, h: number, map: GridMapInfo) {
            let gp = this.debugGridPanes;
            if (!gp) {
                this.debugGridPanes = gp = [];
            }
            let k = 0;
            if ($gm.$showMapGrid) {
                if (!map.map2Screen) {
                    bindMapPos(map);
                }
                const { gridWidth, gridHeight, columns, rows } = map;
                for (let i = x / gridWidth >> 0, len = Math.min(i + w / gridWidth + 1, columns), jstart = y / gridHeight >> 0, jlen = Math.min(jstart + h / gridHeight + 1, rows); i < len; i++) {
                    for (let j = jstart; j < jlen; j++) {
                        let level = map.getWalk(i, j);
                        let tex = getTexture(gridWidth, gridHeight, level);
                        let s = gp[k];
                        if (!s) {
                            gp[k] = s = new egret.Bitmap();
                        }
                        s.texture = tex;
                        let pt = map.map2Screen(i, j);
                        s.x = pt.x;
                        s.y = pt.y;
                        this.addChild(s);
                        k++;
                    }
                }
            }
            for (let i = k; i < gp.length; i++) {
                let bmp = gp[i];
                bmp.texture = null;
                removeDisplay(bmp);
            }
            gp.length = k;

        }
    );

    setInit(map => {
        map.DEBUGgetGridTexture = function (level) {
            return getTexture(map.gridWidth, map.gridHeight, level);
        }
    })
}