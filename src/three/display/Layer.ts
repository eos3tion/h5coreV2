import { DisplayObjectContainer } from "./DisplayObjectContainer";
import { Batcher } from "./Batcher";
import { OrthographicCamera } from "../../../node_modules/three/src/cameras/OrthographicCamera";
import { App } from "../App";

export class Layer extends DisplayObjectContainer {
    batcher: Batcher;
    camera: OrthographicCamera;
    width: number;
    heigth: number;
    constructor() {
        super();
        this.batcher = new Batcher();
        const { width, height } = App;
        this.camera = new OrthographicCamera(0, width, 0, height);
        this.width = width;
        this.heigth = height;
    }

    resize() {
        const camera = this.camera;
        const { innerWidth, innerHeight, width, height } = App;
        camera.right = innerWidth;
        camera.bottom = innerHeight;
        camera.updateProjectionMatrix();
        const scale = Math.min(innerWidth / width, innerHeight / height);
        this.width = innerWidth / scale;
        this.heigth = innerHeight / scale;
        this.scaleX = this.scaleY = scale;
    }

    update() {

    }

    render() {
        const batcher = this.batcher;
        batcher.batchIndex = 0;
        batcher.camera = this.camera;
        batcher.modelViewMatrix.copyFrom(this.getMatrix());
        batcher.color.copyFrom(this.tint);
        super.render(batcher);
        batcher.render();
    }
}