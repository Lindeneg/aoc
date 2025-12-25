class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(o) {
        this.x += o.x;
        this.y += o.y;
        this.z += o.z;
        return this;
    }

    sub(o) {
        this.x -= o.x;
        this.y -= o.y;
        this.z -= o.z;
        return this;
    }

    mul(o) {
        this.x *= o.x;
        this.y *= o.y;
        this.z *= o.z;
        return this;
    }

    div(o) {
        this.x /= o.x;
        this.y /= o.y;
        this.z /= o.z;
        return this;
    }

    scale(f) {
        this.x *= f;
        this.y *= f;
        this.z *= f;
        return this;
    }

    shrink(f) {
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

    dot(o) {
        return this.x * o.x + this.y * o.y + this.z * o.z;
    }

    equals(o) {
        return this.x === o.x && this.y === o.y && this.z === o.z;
    }

    copy() {
        return new Vec3(this.x, this.y, this.z);
    }

    static add(a, b) {
        return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    static sub(a, b) {
        return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    static mul(a, b) {
        return new Vec3(a.x * b.x, a.y * b.y, a.z * b.z);
    }

    static div(a, b) {
        return new Vec3(a.x / b.x, a.y / b.y, a.z / b.z);
    }

    static dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
}

export default Vec3;
