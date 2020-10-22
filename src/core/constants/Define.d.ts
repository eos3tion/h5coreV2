declare type Key = string | number;

declare interface Point2 {
    x: number;
    y: number;
}

declare interface Point3 extends Point2 {
    z: number;
}

declare interface Point4 extends Point3 {
    w: number;
}

declare interface Size {
    width: number;
    height: number;
}

declare interface Rect extends Point2, Size { }