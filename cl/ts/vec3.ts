import type {Point3} from "./types";
import Printable from "./printable";

class Vec3 extends Printable implements Point3 {
    public x: number;
    public y: number;
    public z: number;

    constructor(x = 0, y = 0, z = 0) {
        super();
        this.x = Number(x);
        this.y = Number(y);
        this.z = Number(z);
    }

    add(o: Vec3) {
        this.x += o.x;
        this.y += o.y;
        this.z += o.z;
        return this;
    }

    sub(o: Vec3) {
        this.x -= o.x;
        this.y -= o.y;
        this.z -= o.z;
        return this;
    }

    mul(o: Vec3) {
        this.x *= o.x;
        this.y *= o.y;
        this.z *= o.z;
        return this;
    }

    div(o: Vec3) {
        this.x /= o.x;
        this.y /= o.y;
        this.z /= o.z;
        return this;
    }

    scale(f: number) {
        this.x *= f;
        this.y *= f;
        this.z *= f;
        return this;
    }

    shrink(f: number) {
        this.x /= f;
        this.y /= f;
        this.z /= f;
        return this;
    }

    normalize() {
        const m = this.mag();
        if (m !== 0) {
            this.x /= m;
            this.y /= m;
            this.z /= m;
        }
        return this;
    }

    mag() {
        return Math.sqrt(this.mag2());
    }

    mag2() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    dot(o: Vec3) {
        return this.x * o.x + this.y * o.y + this.z * o.z;
    }

    distance(o: Vec3) {
        const dx = this.x - o.x;
        const dy = this.y - o.y;
        const dz = this.z - o.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    equals(o: Vec3) {
        return this.x === o.x && this.y === o.y && this.z === o.z;
    }

    copy() {
        return new Vec3(this.x, this.y, this.z);
    }

    toString() {
        return `(${this.x},${this.y},${this.z})`;
    }

    static add(a: Vec3, b: Vec3) {
        return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    static sub(a: Vec3, b: Vec3) {
        return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    static mul(a: Vec3, b: Vec3) {
        return new Vec3(a.x * b.x, a.y * b.y, a.z * b.z);
    }

    static div(a: Vec3, b: Vec3) {
        return new Vec3(a.x / b.x, a.y / b.y, a.z / b.z);
    }

    static dot(a: Vec3, b: Vec3) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
}

export default Vec3;
