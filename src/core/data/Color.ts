export class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r = 1, g = 1, b = 1, a = 1) {
        this.set(r, g, b, a);
    }

    set(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        return this;
    }

    setHex(argbColor: number) {
        return this.set(
            ((argbColor >> 16) & 255) / 255,
            ((argbColor >> 8) & 255) / 255,
            (argbColor & 255) / 255,
            ((argbColor >> 24) & 255) / 255
        )
    }

    copyFrom(color: Color) {
        return this.set(color.r, color.g, color.b, color.a);
    }

    concat(color: Color) {
        this.r *= color.r;
        this.g *= color.g;
        this.b *= color.b;
        this.a *= color.a;
        return this;
    }

    prepend(color: Color) {
        return this.concat(color);
    }

    color() {
        return new Color(this.r, this.g, this.b, this.a);
    }
}