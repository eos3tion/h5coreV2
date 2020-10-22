export class Matrix {
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
    constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
        this.set(a, b, c, d, tx, ty);
    }

    identity() {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.tx = 0;
        this.ty = 0;
        return this;
    }

    set(a: number, b: number, c: number, d: number, tx: number, ty: number) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
        return this;
    }

    concat(mat: Matrix) {
        const { a, b, c, d, tx, ty } = mat;
        const { a: rawA, b: rawB, c: rawC, d: rawD, tx: rawTX, ty: rawTY } = this;
        return this.set(
            rawA * a + rawB * c,
            rawA * b + rawB * d,
            rawC * a + rawD * c,
            rawC * b + rawD * d,
            rawTX * a + rawTY * c + tx,
            rawTX * b + rawTY * d + ty
        )
    }

    prepend(mat: Matrix) {
        const { a, b, c, d, tx, ty } = mat;
        const { a: rawA, b: rawB, c: rawC, d: rawD, tx: rawTX, ty: rawTY } = this;
        return this.set(
            rawA * a + rawC * b,
            rawB * a + rawD * b,
            rawA * c + rawC * d,
            rawB * c + rawD * d,
            rawTX + rawA * tx + rawC * ty,
            rawTY + rawB * tx + rawD * ty
        )
    }

    invert() {
        const { a, b, c, d, tx, ty } = this;
        let t = a * d - b * c;
        let na: number, nb: number, nc: number, nd: number, ntx: number, nty: number;
        if (t == 0) {
            na = nb = nc = nd = 0;
            ntx = -tx;
            nty = -ty;
        } else {
            t = 1 / t;
            na = t * d;
            nb = -t * b;
            nc = -t * c;
            nd = t * a;
            ntx = -na * tx - nc * ty;
            nty = -nb * tx - nd * ty;
        }
        return this.set(na, nb, nc, nd, ntx, nty)
    }

    copyFrom(mat: Matrix) {
        return this.set(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
    }

    clone() {
        return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
    }

    transformPoint(point: Point2, result?: Point2) {
        const { x: pointX, y: pointY } = point;
        let x = this.a * pointX + this.c * pointY + this.tx;
        let y = this.b * pointX + this.d * pointY + this.ty;
        result = result || {} as Point2;
        result.x = x;
        result.y = y;
        return result;
    }
}