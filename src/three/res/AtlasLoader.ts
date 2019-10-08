//altas解析参考 https://github.com/EsotericSoftware/spine-runtimes/blob/3.7/spine-ts/core/src/TextureAtlas.ts
import { Res } from "../../core/res/Res";
import { Texture } from "../../../node_modules/three/src/textures/Texture";
import { EventEmitter } from "../../core/utils/EventEmitter";
const { abs } = Math;

function getReader(content: string) {
    let index = 0;
    let lines = content.split(/\r\n|\r|\n/);
    return {
        readLine() {
            if (index < lines.length) {
                return lines[index++];
            }
        },
        readValue() {
            let line = this.readLine();
            let idx = line.indexOf(":");
            if (idx > -1) {
                return line.substring(idx + 1).trim();
            }
        },
        readTuple(tuple: string[]) {
            let line = this.readLine();
            let idx = line.indexOf(":");

            if (idx > -1) {
                let i = 0;
                let lastMatch = idx + 1;
                for (; i < 3; i++) {
                    let comma = line.indexOf(",", lastMatch);
                    if (comma == -1) {
                        break;
                    }
                    tuple[i] = line.substr(lastMatch, comma - lastMatch).trim();
                    lastMatch = comma + 1;
                }
                tuple[i] = line.substr(lastMatch).trim();
                return i + 1;
            }
        }
    }
}

export interface AtlasPage {
    name: string;
    format: string;

    minFilter: string;
    magFilter: string;
    uWrap: TextureWrap;
    vWrap: TextureWrap;
    width: number;
    height: number;
}

export class AtlasRegion extends EventEmitter {
    page: AtlasPage;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    u1: number;
    v1: number;
    u2: number;
    v2: number;
    offsetX: number;
    offsetY: number;

    originalWidth: number;

    originalHeight: number;

    index: number;

    rotate: boolean;

    texture: Texture;

}

// const Format = {
//     alpha: 0,
//     intensity: 1,
//     luminanceAlpha: 2,
//     rgb565: 3,
//     rgba4444: 4,
//     rgb888: 5,
//     rgba8888: 6
// }

// const TextureFilter = {
//     nearest: 0,
//     linear: 1,
//     mipMap: 2,
//     mipMapNearestNearest: 3,
//     mipMapLinearNearest: 4,
//     mipMapNearestLinear: 5,
//     mipMapLinearLinear: 6
// }

const enum TextureWrap {
    MirroredRepeat = 0,
    ClampToEdge = 1,
    Repeat = 2
}

const tuple = new Array<string>(4);

export interface AtlasData {
    pages: AtlasPage[];

    regions: AtlasRegion[];
}

class AtlasLoader extends Res.BinLoader {
    constructor() {
        super(HttpResponseType.Text);
    }

    parseResponse(response: string) {
        let reader = getReader(response);
        let pages: AtlasPage[] = [];
        let regions: AtlasRegion[] = [];
        let page: AtlasPage;
        while (true) {
            let line = reader.readLine();
            if (!line) {
                break;
            }
            if (!line.length) {//空行代表下一页
                page = null;
            } else if (!page) {
                page = {} as AtlasPage;
                page.name = line;
                if (reader.readTuple(tuple) == 2) {
                    page.width = ~~tuple[0];
                    page.height = ~~tuple[1];
                    reader.readTuple(tuple);
                }
                page.format = tuple[0];//Format
                reader.readTuple(tuple);
                page.minFilter = tuple[0];//TextureFilter
                page.magFilter = tuple[1];

                let direction = reader.readValue();
                page.uWrap = TextureWrap.ClampToEdge;
                page.vWrap = TextureWrap.ClampToEdge;

                if (direction == "x") {
                    page.uWrap = TextureWrap.Repeat;
                } else if (direction == "y") {
                    page.vWrap = TextureWrap.Repeat;
                } else if (direction == "xy") {
                    page.uWrap = page.vWrap = TextureWrap.Repeat;
                }
                pages.push(page);
            } else {
                let region = {} as AtlasRegion;
                region.name = line;
                region.page = page;

                region.rotate = reader.readValue() == "true";

                reader.readTuple(tuple);
                let x = parseInt(tuple[0]);
                let y = parseInt(tuple[1]);

                reader.readTuple(tuple);
                let width = parseInt(tuple[0]);
                let height = parseInt(tuple[1]);

                const { width: pwidth, height: pheight } = page;

                region.u1 = x / pwidth;
                region.v1 = y / pheight;
                if (region.rotate) {
                    region.u2 = (x + height) / pwidth;
                    region.v2 = (y + width) / pheight;
                } else {
                    region.u2 = (x + width) / pwidth;
                    region.v2 = (y + height) / pheight;
                }
                region.x = x;
                region.y = y;
                region.width = abs(width);
                region.height = abs(height);

                if (reader.readTuple(tuple) == 4) { // split is optional
                    // region.splits = new Vector.<int>(parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3]));
                    if (reader.readTuple(tuple) == 4) { // pad is optional, but only present with splits
                        //region.pads = Vector.<int>(parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3]));
                        reader.readTuple(tuple);
                    }
                }

                region.originalWidth = ~~tuple[0];
                region.originalHeight = ~~tuple[1];

                reader.readTuple(tuple);
                region.offsetX = ~~tuple[0];
                region.offsetY = ~~tuple[1];

                region.index = parseInt(reader.readValue());

                regions.push(region);
            }

            return {
                pages,
                regions
            } as AtlasData
        }
    }
}

Res.bind(ResItemType.Atlas, new AtlasLoader, Ext.Atlas);