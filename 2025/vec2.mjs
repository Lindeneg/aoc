class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        this.x += other.x;
        this.y += other.y;
    }

    sub(other) {
        this.x -= other.x;
        this.y -= other.y;
    }

    mul(other) {
        this.x *= other.x;
        this.y *= other.y;
    }

    div(other) {
        this.x /= other.x;
        this.y /= other.y;
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
}

export default Vec2;
