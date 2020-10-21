declare module egret {
    export interface DisplayObject {
        $layoutHost: import("./LayoutContainer").LayoutContainer;
    }
}