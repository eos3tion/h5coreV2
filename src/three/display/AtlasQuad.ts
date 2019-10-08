import { TextureQuad } from "./TextureQuad";
import { Default } from "../res/TextureLoader";
import { AtlasRegion } from "../res/AtlasLoader";
import { Res } from "../../core/res/Res";


function onRegionLoad(this: AtlasQuad) {
    let region = this.region;
    if (region) {
        this.texture = region.texture;
        this.setUvBox(region.u1, region.v1, region.u2, region.v2);
    } else {
        this.texture = Default;
    }
}

export class AtlasQuad extends TextureQuad {
    region: AtlasRegion = null;
    onRegionLoad: () => void;

    constructor() {
        super();
        this.onRegionLoad = onRegionLoad.bind(this);
    }

    setRegion(region: AtlasRegion) {
        let old = this.region;
        if (old != region) {
            if (old) {
                old.off(EventConst.Load, this.onRegionLoad);
            }
            this.region = region;
            this.onRegionLoad();
            if (region) {
                region.on(EventConst.Load, this.onRegionLoad);
            }
        }
        return this;
    }
}

export function fromRect(x: number, y: number, width: number, height: number, file: string) {
    let q = new AtlasQuad;
    q.setRect(x, y, width, height);
    q.setRegion(Res.get(file))
}