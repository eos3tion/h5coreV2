import { Matrix } from "../../core/data/Matrix";
import { Color } from "../../core/data/Color";
import { Scene } from "../../../node_modules/three/src/scenes/Scene";
import { ImmediateRenderObject } from "../../../node_modules/three/src/extras/objects/ImmediateRenderObject";
import { App } from "../App";
import { Camera } from "../../../node_modules/three/src/cameras/Camera";
import { Texture } from "../../../node_modules/three/src/textures/Texture";

interface StackData {
    copyFrom(a: this): void;
}

interface StackDataCreator<T extends StackData> {
    new(): T;
}

class Stack<T extends StackData> {
    stacks: T[];
    size: number;
    ctor: StackDataCreator<T>;
    constructor(ctor: StackDataCreator<T>) {
        this.ctor = ctor;
        this.stacks = [];
        this.size = 0;
    }

    push(t: T) {
        let { stacks, size, ctor } = this;
        if (stacks.length < size + 1) {
            stacks.push(new ctor);
        }
        stacks[size++].copyFrom(t);
        this.size = size;
    }

    pop(t: T) {
        t.copyFrom(this.stacks[--this.size]);
    }
}

function formatSize(size: number) {
    size = size | 0;
    if (size < 0) {
        size = 0;
    }
    return size;
}

export const enum BatchArrayKey {
    Position = "positionArray",
    Color = "colorArray",

    UV = "uvArray",
    Normal = "normalArray"
}

export class Batch extends ImmediateRenderObject {
    /**
     * 对应 three.js 中 `WebGLRenderer.js` 
     * `renderBufferImmediate` object.count
     */
    count: number;

    blending: Blending;

    positionArray?: Float32Array;
    hasPositions?: boolean;

    hasColors?: boolean;
    colorArray?: Float32Array;

    hasUvs?: boolean;
    uvArray?: Float32Array;

    hasNormals?: boolean;
    normalArray?: Float32Array;

    texture?: Texture;

    constructor() {
        super(null);
        this.reset();
        this.count = 0;
        this.visible = false;
    }

    reset(positionSize = 0, colorSize = 0, uvSize = 0, normalSize = 0) {
        positionSize = formatSize(positionSize);
        colorSize = formatSize(colorSize);
        uvSize = formatSize(uvSize);
        normalSize = formatSize(normalSize);

        this.hasPositions = !!positionSize;
        if (positionSize && !this.positionArray) {
            this.positionArray = new Float32Array(positionSize)
        }

        this.hasColors = !!colorSize;
        if (colorSize && !this.colorArray) {
            this.colorArray = new Float32Array(colorSize)
        }

        this.hasUvs = !!uvSize;
        if (uvSize && !this.uvArray) {
            this.uvArray = new Float32Array(uvSize);
        }

        this.hasNormals = !!normalSize;
        if (normalSize && !this.normalArray) {
            this.normalArray = new Float32Array(normalSize);
        }
    }

    expand(need: number, key: BatchArrayKey) {
        let array = this[key];
        let len = array.length;
        if (need > len) {
            let newSize = Math.max(need, len * 2)
            let newArray = new Float32Array(newSize);
            newArray.set(array);
            this[key] = array = newArray;
        }
        return array;
    }

}

export class Batcher {
    scene: Scene;
    modelViewMatrix: Matrix;
    matrixStack: Stack<Matrix>;
    color: Color;
    colorStack: Stack<Color>;
    batches: Batch[];
    batchIndex: number;
    camera: Camera;
    constructor() {
        let scene = new Scene;
        let self = this;
        self.scene = scene;
        self.modelViewMatrix = new Matrix;
        self.matrixStack = new Stack(Matrix);
        self.color = new Color;
        self.colorStack = new Stack(Color);
        let a = new ImmediateRenderObject(null) as Batch;
        a.count = 0;
        a.visible = false;
        self.batches = [a];
        scene.add(a);
        self.batchIndex = 0;
    }

    pushMatrix() {
        this.matrixStack.push(this.modelViewMatrix);
    }

    popMatrix() {
        this.matrixStack.pop(this.modelViewMatrix);
    }

    pushColor() {
        this.colorStack.push(this.color);
    }

    popColor() {
        this.colorStack.pop(this.color);
    }

    prependMatrix(mat: Matrix) {
        this.modelViewMatrix.prepend(mat);
    }

    prependColor(color: Color) {
        this.color.prepend(color);
    }

    flush() {
        let { batches, batchIndex } = this;
        if (batches[batchIndex].count > 0) {
            this.batchIndex = ++batchIndex;
            if (batchIndex == batches.length) {
                let a = new Batch;
                batches[batchIndex] = a;
                this.scene.add(a);
            }
        }
    }

    render() {
        this.flush();
        const { batches, batchIndex, scene, camera } = this;
        for (let i = 0; i < batchIndex; i++) {
            batches[i].visible = true;
        }
        App.renderer.render(scene, camera);
        for (let i = 0; i < batches.length; i++) {
            batches[i].visible = false;
        }
    }
}