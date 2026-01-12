import Vec2 from "./vec2";
import {success, failure, type Result} from "./result";
import type {Compressible} from "./compressor";

/**
 * Axis-aligned rectangle in 2D space.
 *
 * Direct construction is private. Use factory methods:
 * - `Rect.make()`               - Create from min/max coordinates
 * - `Rect.fromVecBounds()`      - Create from two Vec2 bounds
 * - `Rect.fromOppositePoints()` - Create from any two opposite corners
 * - `Rect.fromPointAndSize()`   - Create from origin point and dimensions
 */
class Rect2 {
    public readonly topLeft: Vec2;
    public readonly topRight: Vec2;
    public readonly bottomRight: Vec2;
    public readonly bottomLeft: Vec2;

    public readonly min: Vec2;
    public readonly max: Vec2;

    public readonly width: number;
    public readonly height: number;

    /** Private constructor. Use factory methods instead. */
    private constructor(
        minX: number,
        minY: number,
        maxX: number,
        maxY: number
    ) {
        this.min = new Vec2(minX, minY);
        this.max = new Vec2(maxX, maxY);

        this.width = maxX - minX;
        this.height = maxY - minY;

        this.topLeft = new Vec2(minX, minY);
        this.topRight = new Vec2(maxX, minY);
        this.bottomRight = new Vec2(maxX, maxY);
        this.bottomLeft = new Vec2(minX, maxY);
    }

    /** Returns the four edges of the rectangle as line segments. */
    edges(): [Vec2, Vec2][] {
        return [
            [this.topLeft, this.topRight],
            [this.topRight, this.bottomRight],
            [this.bottomRight, this.bottomLeft],
            [this.bottomLeft, this.topLeft],
        ];
    }

    /** Calculates the area (width × height). */
    area() {
        return this.width * this.height;
    }

    /** Calculates the inclusive area treating coordinates as discrete cells. */
    areaInclusive() {
        return (this.width + 1) * (this.height + 1);
    }

    /** Creates a rectangle from min/max coordinates. */
    static make(
        minX: number,
        minY: number,
        maxX: number,
        maxY: number
    ): Result<Rect2> {
        if (maxX < minX || maxY < minY) {
            return failure("RECT2: max must be >= min");
        }
        return success(new Rect2(minX, minY, maxX, maxY));
    }

    /** Creates a compressed rectangle using a coordinate compressor. */
    static compress(
        rect: Rect2,
        compressor: Compressible<Vec2>
    ): Result<Rect2> {
        const minResult = rect.min.compress(compressor);
        if (!minResult.ok) return minResult;
        const maxResult = rect.max.compress(compressor);
        if (!maxResult.ok) return maxResult;
        return Rect2.fromVecBounds(minResult.data, maxResult.data);
    }

    /** Creates a rectangle from two Vec2 bounds. */
    static fromVecBounds(min: Vec2, max: Vec2): Result<Rect2> {
        return Rect2.make(min.x, min.y, max.x, max.y);
    }

    /**
     * Creates a rectangle from any two opposite corner points.
     * Automatically determines which point is min and which is max.
     */
    static fromOppositePoints(p1: Vec2, p2: Vec2): Result<Rect2> {
        const minX = Math.min(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxX = Math.max(p1.x, p2.x);
        const maxY = Math.max(p1.y, p2.y);
        return Rect2.make(minX, minY, maxX, maxY);
    }

    /** Creates a rectangle from an origin point and dimensions. */
    static fromPointAndSize(
        p0: Vec2,
        width: number,
        height: number
    ): Result<Rect2> {
        if (width < 0 || height < 0) {
            return failure("RECT2: width and height must be non-negative");
        }
        return Rect2.make(p0.x, p0.y, p0.x + width, p0.y + height);
    }
}

export default Rect2;
