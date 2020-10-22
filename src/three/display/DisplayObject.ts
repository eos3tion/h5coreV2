import { Matrix } from "../../core/data/Matrix";
import { Color } from "../../core/data/Color";
import { clamp } from "../../core/utils/Math";
import { DisplayObjectContainer } from "./DisplayObjectContainer";
import { EventEmitter } from "../../core/event/EventEmitter";
import { Batcher } from "./Batcher";

const _matrix = new Matrix;
const { PI, sin, cos, sqrt, atan2 } = Math;
const Deg2Rad = PI / 180;
const Rad2Deg = 180 / PI;

export class DisplayObject extends EventEmitter {

    x = 0;
    y = 0;

    scaleX = 1;
    scaleY = 1;

    rotation = 0;

    _x = 0;
    _y = 0;

    _scaleX = 1;
    _scaleY = 1;

    _rotation = 0;

    _skewA = 1;
    _skewB = 0;
    _skewC = 0;
    _skewD = 1;

    _matrix = new Matrix;

    visible = true;
    blending: number = Blending.NormalBlending;

    name = "";

    tint = new Color();

    _parent: DisplayObjectContainer = null;

    constructor() {
        super();
    }

    get alpha() {
        return this.tint.a;
    }

    set alpha(value: number) {
        const tint = this.tint;
        if (value != tint.a) {
            tint.a = clamp(value, 0, 1);
        }
    }

    updateMatrix() {
        const { _skewA, _skewB, _skewC, _skewD, scaleX, scaleY, _matrix, rotation, x, y } = this;
        let l1 = _skewA * scaleX;
        let l2 = _skewB * scaleX;
        let l3 = _skewC * scaleY;
        let l4 = _skewD * scaleY;
        let rad = rotation * Deg2Rad;
        let s = sin(rad);
        let c = cos(rad);
        _matrix.set(
            l1 * c - l2 * s,
            l1 * s + l2 * c,
            l3 * c - l4 * s,
            l3 * s + l4 * c,
            x,
            y
        );
        this._x = x;
        this._y = y;
        this._scaleX = scaleX;
        this._scaleY = scaleY;
        this._rotation = rotation;
    }

    getMatrix() {
        if (
            this.x != this._x ||
            this.y != this._y ||
            this.scaleX != this._scaleX ||
            this.scaleY != this._scaleY ||
            this.rotation != this._rotation
        ) {
            this.updateMatrix();
        }
        return this._matrix;
    }

    setMatrix(mat: Matrix) {
        let { a, b, c, d, tx, ty } = mat;
        this.x = tx;
        this.y = ty;
        let len1 = sqrt(a * a + b * b);
        let len2 = sqrt(c * c + d * d);
        if (a * d - b * c < 0) {
            if (b == 0 && c == 0 && d == 1) {
                len1 = -len1;
            } else {
                len2 = -len2;
            }
        }
        this.scaleX = len1;
        this.scaleY = len2;
        let f = atan2(b, len2 < 0 ? -a : a);
        this.rotation = f * Rad2Deg;
        let si = sin(-f);
        let co = cos(-f);
        let _skewA = a * co - b * si;
        let _skewB = a * si + b * co;
        let _skewC = c * co - d * si;
        let _skewD = c * si + d * co;
        if (len1 !== 0) {
            _skewA /= len1;
            _skewB /= len1;
        }
        if (len2 !== 0) {
            _skewC /= len2;
            _skewD /= len2;
        }
        this._skewA = _skewA;
        this._skewB = _skewB;
        this._skewC = _skewC;
        this._skewD = _skewD;
        this.updateMatrix();
    }

    set parent(parent: DisplayObjectContainer) {
        let a: DisplayObject = parent;
        while (a && a != this) {
            a = a.parent;
        }
        if (a != this) {
            this._parent = parent;
        }
        //else TODO 抛错，不能添加自己为`parent`
    }

    get parent() {
        return this._parent;
    }

    globalToLocal(global: Point2, result?: Point2) {
        const matrix = _matrix;
        matrix.copyFrom(this.getMatrix());
        let d = this.parent;
        while (d) {
            matrix.concat(d.getMatrix());
            d = d.parent;
        }
        matrix.invert();
        return matrix.transformPoint(global, result);
    }

    localToGlobal(global: Point2, result?: Point2) {
        const matrix = _matrix;
        matrix.copyFrom(this.getMatrix());
        let d = this.parent;
        while (d) {
            matrix.concat(d.getMatrix());
            d = d.parent;
        }
        return matrix.transformPoint(global, result);
    }

    render(_batch?: Batcher) { }
}