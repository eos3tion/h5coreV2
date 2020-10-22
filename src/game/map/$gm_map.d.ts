interface $gmType {
    /**
     * 显示/关闭地图格子显示
     */
    toggleMapGrid(): void;
    $showMapGrid: boolean;

    regPathDraw(type: import("./MapInfo").MapPathType, handler: drawMapPath): void;

    pathSolution: { [type: number]: drawMapPath };
}

type drawMapPath = { (x: number, y: number, w: number, h: number, map: import("./MapInfo").MapInfo): any }