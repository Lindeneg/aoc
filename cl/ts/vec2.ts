import Printable from "./printable";
import type {Compressible, Point2, Result} from "./types";

class Vec2 extends Printable implements Point2 {
    public x: number;
    public y: number;

    constructor(x = 0, y = 0) {
        super();
        this.x = Number(x);
        this.y = Number(y);
    }

    add(o: Vec2) {
        return new Vec2(this.x + o.x, this.y + o.y);
    }

    sub(o: Vec2) {
        return new Vec2(this.x - o.x, this.y - o.y);
    }

    mul(o: Vec2) {
        return new Vec2(this.x * o.x, this.y * o.y);
    }

    div(o: Vec2) {
        return new Vec2(this.x / o.x, this.y / o.y);
    }

    scale(f: number) {
        return new Vec2(this.x * f, this.y * f);
    }

    shrink(f: number) {
        return new Vec2(this.x / f, this.y / f);
    }

    normalize() {
        const m = this.mag();
        if (m === 0) return new Vec2(0, 0);
        return this.shrink(m);
    }

    compress(compressor: Compressible<Vec2>): Result<Vec2> {
        return compressor.compress(this.copy());
    }

    compressMut(compressor: Compressible<Vec2>): Result<Vec2> {
        return compressor.compress(this);
    }

    addMut(o: Vec2) {
        this.x += o.x;
        this.y += o.y;
        return this;
    }

    subMut(o: Vec2) {
        this.x -= o.x;
        this.y -= o.y;
        return this;
    }

    mulMut(o: Vec2) {
        this.x *= o.x;
        this.y *= o.y;
        return this;
    }

    divMut(o: Vec2) {
        this.x /= o.x;
        this.y /= o.y;
        return this;
    }

    scaleMut(f: number) {
        this.x *= f;
        this.y *= f;
        return this;
    }

    shrinkMut(f: number) {
        this.x /= f;
        this.y /= f;
        return this;
    }

    normalizeMut() {
        const m = this.mag();
        if (m !== 0) this.shrinkMut(m);
        return this;
    }

    mag() {
        return Math.sqrt(this.mag2());
    }

    mag2() {
        return this.x * this.x + this.y * this.y;
    }

    dot(o: Vec2) {
        return this.x * o.x + this.y * o.y;
    }

    distance(o: Vec2) {
        const dx = this.x - o.x;
        const dy = this.y - o.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    equals(o: Vec2) {
        return this.x === o.x && this.y === o.y;
    }

    copy() {
        return new Vec2(this.x, this.y);
    }

    toString() {
        return `(${this.x},${this.y})`;
    }
}

export default Vec2;
