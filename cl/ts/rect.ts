import type {Compressible} from "./types";
import Vec2 from "./vec2";

class Rect {
    public readonly topLeft: Vec2;
    public readonly topRight: Vec2;
    public readonly bottomRight: Vec2;
    public readonly bottomLeft: Vec2;

    public readonly min: Vec2;
    public readonly max: Vec2;

    public readonly width: number;
    public readonly height: number;

    constructor(minX: number, minY: number, maxX: number, maxY: number) {
        if (maxX < minX || maxY < minY) {
            throw new Error("Invalid Rect: max must be >= min");
        }

        this.min = new Vec2(minX, minY);
        this.max = new Vec2(maxX, maxY);

        this.width = maxX - minX;
        this.height = maxY - minY;

        this.topLeft = new Vec2(minX, minY);
        this.topRight = new Vec2(maxX, minY);
        this.bottomRight = new Vec2(maxX, maxY);
        this.bottomLeft = new Vec2(minX, maxY);
    }

    edges(): [Vec2, Vec2][] {
        return [
            [this.topLeft, this.topRight],
            [this.topRight, this.bottomRight],
            [this.bottomRight, this.bottomLeft],
            [this.bottomLeft, this.topLeft],
        ];
    }

    area() {
        return this.width * this.height;
    }

    areaInclusive() {
        return (this.width + 1) * (this.height + 1);
    }

    static compress(rect: Rect, compressor: Compressible<Vec2>): Rect {
        return Rect.fromVecBounds(
            Vec2.compress(rect.min, compressor),
            Vec2.compress(rect.max, compressor)
        );
    }

    static fromVecBounds(min: Vec2, max: Vec2): Rect {
        return new Rect(min.x, min.y, max.x, max.y);
    }

    static fromOppositePoints(p1: Vec2, p2: Vec2): Rect {
        const minX = Math.min(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxX = Math.max(p1.x, p2.x);
        const maxY = Math.max(p1.y, p2.y);

        return new Rect(minX, minY, maxX, maxY);
    }

    static fromPointAndSize(p0: Vec2, width: number, height: number): Rect {
        if (width < 0 || height < 0) {
            throw new Error("Width and height must be non-negative");
        }

        return new Rect(p0.x, p0.y, p0.x + width, p0.y + height);
    }
}

export default Rect;
