import { RawShaderMaterial } from "../../../node_modules/three/src/materials/RawShaderMaterial";
import { DisplayObjectContainer } from "./DisplayObjectContainer";
import { Vector2 } from "../../../node_modules/three/src/math/Vector2";
import { Color } from "../../core/data/Color";
import { isLeft } from "../../core/geom/GeomUtils";
import { Batcher, BatchArrayKey } from "./Batcher";
import { getPrecisionHeader } from "./ShaderChunk";
import { solvePositions, solveColors, QuadConst } from "./QuadHelper";




const pt = new Vector2;


export class Quad extends DisplayObjectContainer {
    /**
     * 左上
     */
    v1 = new Vector2;
    /**
     * 右上
     */
    v2 = new Vector2;
    /**
     * 右下
     */
    v3 = new Vector2;
    /**
     * 左下
     */
    v4 = new Vector2;

    c1 = new Color;
    c2 = new Color;
    c3 = new Color;
    c4 = new Color;

    setRect(x: number, y: number, width: number, height: number) {
        const right = x + width;
        const bottom = y + height;
        this.v1.set(x, y);
        this.v2.set(right, y);
        this.v3.set(right, bottom);
        this.v4.set(x, bottom);
        return this;
    }

    setColor(r: number, g: number, b: number, a: number) {
        this.c1.set(r, g, b, a);
        this.c2.set(r, g, b, a);
        this.c3.set(r, g, b, a);
        this.c4.set(r, g, b, a);
        return this;
    }

    setColorHex(argbColor: number) {
        this.c1.setHex(argbColor);
        this.c2.setHex(argbColor);
        this.c3.setHex(argbColor);
        this.c4.setHex(argbColor);
        return this;
    }

    isUnderPoint(pointX: number, pointY: number) {
        pt.set(pointX, pointY);
        this.globalToLocal(pt, pt);
        const { v1, v2, v3, v4 } = this;
        let a = isLeft(pt, v1, v2);
        let b = isLeft(pt, v2, v3);
        let c = isLeft(pt, v3, v4);
        let d = isLeft(pt, v4, v1);
        return a == b && a == c && a == d;
    }

    render(batch: Batcher) {
        batchQuad(batch, this);
        super.render(batch);
    }
}


let getMaterial = function () {
    const QuadMaterialVertexShader =
        `uniform mat4 modelViewMatrix; 
uniform mat4 projectionMatrix; 
attribute vec2 position; 
attribute vec4 color; 
varying vec4 vColor; 
void main() {  
    vColor = color;  
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 0.0, 1.0); 
}`;

    const QuadMaterialFragmentShader =
        `varying vec4 vColor; 
void main() {  
    gl_FragColor = vColor; 
}`
    const a = getPrecisionHeader()
    let m = new RawShaderMaterial({
        vertexShader: a + QuadMaterialVertexShader,
        fragmentShader: a + QuadMaterialFragmentShader,
        depthTest: false,
        depthWrite: false,
        transparent: true
    });

    getMaterial = function () {
        return m;
    };
    return m;
}

const type = "Quad";

function batchQuad(batcher: Batcher, q: Quad) {
    let batch = batcher.batches[batcher.batchIndex];
    if ((batch.type !== type) || (batch.blending !== q.blending)) {
        batcher.flush();
        batch.type = type;
        let material = getMaterial();
        batch.material = material;
        batch.blending = material.blending = q.blending;
        batch.reset(QuadConst.PositionCount, QuadConst.ColorCount);

    }
    let offset = batch.count;
    let positions = batch.expand((offset + QuadConst.VectorCount) * QuadConst.PositionSize, BatchArrayKey.Position);
    let colors = batch.expand((offset + QuadConst.VectorCount) * QuadConst.ColorSize, BatchArrayKey.Color);

    offset *= 2;
    solvePositions(offset, positions, q, batcher.modelViewMatrix);

    offset *= 2;
    solveColors(offset, colors, q, batcher.color);

    batch.count += 6
}



export function fromRect(x: number, y: number, width: number, height: number) {
    return new Quad().setRect(x, y, width, height);
}

export function fromRectColor(x: number, y: number, width: number, height: number, r: number, g: number, b: number, a: number) {
    return new Quad().setRect(x, y, width, height).setColor(r, g, b, a);
}