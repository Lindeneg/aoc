class Vec2 {
    public x: number;
    public y: number;

    constructor(x = 0, y = 0) {
        this.x = Number(x);
        this.y = Number(y);
    }

    add(o: Vec2) {
        this.x += o.x;
        this.y += o.y;
        return this;
    }

    sub(o: Vec2) {
        this.x -= o.x;
        this.y -= o.y;
        return this;
    }

    mul(o: Vec2) {
        this.x *= o.x;
        this.y *= o.y;
        return this;
    }

    div(o: Vec2) {
        this.x /= o.x;
        this.y /= o.y;
        return this;
    }

    scale(f: number) {
        this.x *= f;
        this.y *= f;
        return this;
    }

    shrink(f: number) {
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

    static add(a: Vec2, b: Vec2) {
        return new Vec2(a.x + b.x, a.y + b.y);
    }

    static sub(a: Vec2, b: Vec2) {
        return new Vec2(a.x - b.x, a.y - b.y);
    }

    static mul(a: Vec2, b: Vec2) {
        return new Vec2(a.x * b.x, a.y * b.y);
    }

    static div(a: Vec2, b: Vec2) {
        return new Vec2(a.x / b.x, a.y / b.y);
    }

    static dot(a: Vec2, b: Vec2) {
        return a.x * b.x + a.y * b.y;
    }
}

export default Vec2;
