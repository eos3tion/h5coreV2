declare type Key = string | number;

declare interface Point {
    x: number;
    y: number;
}

declare interface Point3 extends Point {
    z: number;
}

declare interface Point4 extends Point3 {
    w: number;
}

declare interface Size {
    width: number;
    height: number;
}

declare interface Rect extends Point, Size { }