class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = Number(x);
        this.y = Number(y);
    }

    add(o) {
        this.x += o.x;
        this.y += o.y;
        return this;
    }

    sub(o) {
        this.x -= o.x;
        this.y -= o.y;
        return this;
    }

    mul(o) {
        this.x *= o.x;
        this.y *= o.y;
        return this;
    }

    div(o) {
        this.x /= o.x;
        this.y /= o.y;
        return this;
    }

    scale(f) {
        this.x *= f;
        this.y *= f;
        return this;
    }

    shrink(f) {
        this.x /= f;
        this.y /= f;
        return this;
    }

    normalize() {
        const m = this.mag();
        if (m !== 0) this.shrink(m);
        return this;
    }

    mag() {
        return Math.sqrt(this.mag2());
    }

    mag2() {
        return this.x * this.x + this.y * this.y;
    }

    dot(o) {
        return this.x * o.x + this.y * o.y;
    }

    distance(o) {
        const dx = this.x - o.x;
        const dy = this.y - o.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    equals(o) {
        return this.x === o.x && this.y === o.y;
    }

    copy() {
        return new Vec2(this.x, this.y);
    }

    toString() {
        return `(${this.x},${this.y})`;
    }

    static add(a, b) {
        return new Vec2(a.x + b.x, a.y + b.y);
    }

    static sub(a, b) {
        return new Vec2(a.x - b.x, a.y - b.y);
    }

    static mul(a, b) {
        return new Vec2(a.x * b.x, a.y * b.y);
    }

    static div(a, b) {
        return new Vec2(a.x / b.x, a.y / b.y);
    }

    static dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }
}

export default Vec2;
