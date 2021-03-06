import { MapPathType } from "../../../../game/map/MapInfo";
import { NavMeshMapInfo } from "../../../../game/map/path/navmesh/NavMeshMapInfo";
import { removeDisplay } from "../../../EgretExtend";
import { TileMapLayer } from "../tilemap/TileMapLayer";


interface NavMeshDraw {
    debugPane?: egret.Sprite;
}

const rect = new egret.Rectangle;
if (DEBUG) {
    $gm.regPathDraw(MapPathType.NavMesh,
        function (this: TileMapLayer & NavMeshDraw, x: number, y: number, w: number, h: number, map: NavMeshMapInfo) {
            let gp = this.debugPane;
            if (!gp) {
                this.debugPane = gp = new egret.Sprite;
            }
            if ($gm.$showMapGrid) {
                let cells = map.cells;
                const g = gp.graphics;
                gp.removeChildren();
                g.clear();
                if (cells) {
                    rect.setTo(x, y, w, h);
                    g.lineStyle(2, 0xff00);
                    for (let i = 0; i < cells.length; i++) {
                        const { pA, pB, pC, x, y, idx } = cells[i];
                        if (rect.containsPoint(pA) || rect.containsPoint(pB) || rect.containsPoint(pC) || rect.contains(x, y)) {
                            let tf = new egret.TextField();

                            tf.size = 18;
                            tf.strokeColor = 0;
                            tf.textColor = 0xff00;
                            tf.text = idx + "";
                            tf.x = x - tf.textWidth * .5;
                            tf.y = y - tf.textHeight * .5;
                            gp.addChild(tf);
                            g.beginFill(0xff00, 0.1);
                            g.moveTo(pA.x, pA.y);
                            g.lineTo(pB.x, pB.y);
                            g.lineTo(pC.x, pC.y);
                            g.lineTo(pA.x, pA.y);
                            g.endFill();
                        }
                    }
                    this.addChild(gp);
                }
            } else {
                removeDisplay(gp);
            }
        }
    );
}