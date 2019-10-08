import { RawShaderMaterial } from "../../../node_modules/three/src/materials/RawShaderMaterial";
import { getPrecisionHeader } from "./ShaderChunk";
import { Quad } from "./Quad";
import { Vector2 } from "../../../node_modules/three/src/math/Vector2";
import { Texture } from "../../../node_modules/three/src/textures/Texture";
import { Default } from "../res/TextureLoader";
import { Batcher, BatchArrayKey } from "./Batcher";
import { DisplayObjectContainer } from "./DisplayObjectContainer";
import { solvePositions, solveColors, solveUvs, QuadConst } from "./QuadHelper";

export interface TextureQuadMaterial extends RawShaderMaterial {
    texture: Texture;
}

function getMaterial(texture: Texture) {
    const TextureQuadMaterialVertexShader =
        `uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec2 position;
attribute vec4 color;
attribute vec2 uv;
varying vec4 vColor;
varying vec2 vUv;
void main() {  
    vColor = color;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 0.0, 1.0);
}`;
    const TextureQuadMaterialFragmentShader =
        `varying vec4 vColor;
varying vec2 vUv;
uniform sampler2D map;
void main() {  
    gl_FragColor = vColor * texture2D(map, vUv);
}`;

    const a = getPrecisionHeader()
    let m = new RawShaderMaterial({
        uniforms: {
            map: {
                type: "t",
                value: a
            }
        },
        vertexShader: a + TextureQuadMaterialVertexShader,
        fragmentShader: a + TextureQuadMaterialFragmentShader,
        depthTest: false,
        depthWrite: false,
        transparent: true
    }) as TextureQuadMaterial;
    m.texture = texture;
    return m;
}

const materials = {} as { [id: number]: TextureQuadMaterial };

export class TextureQuad extends Quad {
    uv1: Vector2;
    uv2: Vector2;
    uv3: Vector2;
    uv4: Vector2;
    texture: Texture;
    constructor() {
        super();
        this.uv1 = new Vector2(0, 1);
        this.uv2 = new Vector2(1, 1);
        this.uv3 = new Vector2(1, 0);
        this.uv4 = new Vector2(0, 0);
        this.texture = Default;
    }

    setUvRect(x: number, y: number, width: number, height: number) {
        const right = x + width;
        const bottom = y + height;
        this.uv1.set(x, y);
        this.uv2.set(right, y);
        this.uv3.set(right, bottom);
        this.uv4.set(x, bottom);
        return this;
    }

    setUvBox(left: number, top: number, right: number, bottom: number) {
        this.uv1.set(left, top);
        this.uv2.set(right, top);
        this.uv3.set(right, bottom);
        this.uv4.set(left, bottom);
        return this;
    }

    render(batcher: Batcher) {
        batchTextureQuad(batcher, this);
        DisplayObjectContainer.prototype.render.call(this, batcher);
    }
}

const type = "TextureQuad";

function batchTextureQuad(batcher: Batcher, q: TextureQuad) {
    let batch = batcher.batches[batcher.batchIndex];
    if ((batch.type !== type) || (batch.blending !== q.blending)) {
        batcher.flush();
        batch.type = type;
        batch.reset(QuadConst.PositionCount, QuadConst.ColorCount, QuadConst.UVCount);
        let texture = q.texture;
        const tid = texture.id;
        let material = materials[tid];
        if (!material) {
            materials[tid] = material = getMaterial(texture);
        }
        batch.material = material;
        batch.texture = texture;
        batch.blending = material.blending = q.blending;
    }


    let offset = batch.count;

    let positions = batch.expand((offset + QuadConst.VectorCount) * QuadConst.PositionSize, BatchArrayKey.Position);

    let uvs = batch.expand((offset + QuadConst.VectorCount) * QuadConst.UVSize, BatchArrayKey.UV);

    let colors = batch.expand((offset + QuadConst.VectorCount) * QuadConst.ColorSize, BatchArrayKey.Color);


    offset *= 2;

    solvePositions(offset, positions, q, batcher.modelViewMatrix);

    solveUvs(offset, uvs, q);

    offset *= 2;

    solveColors(offset, colors, q, batcher.color);

    batch.count += 6
}

export function fromRect(x: number, y: number, width: number, height: number, texture: Texture) {
    let q = new TextureQuad().setRect(x, y, width, height);
    q.texture = texture;
    return q;
}