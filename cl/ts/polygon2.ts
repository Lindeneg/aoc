import Vec2 from "./vec2";
import Rect2 from "./rect2";
import {success, failure, type Result} from "./result";
import {pointOnSegment2, segmentsIntersect2} from "./geometry";

type PolygonVertices<T> = [T, T, T, ...T[]];

/**
 * 2D polygon with point-in-polygon and containment tests.
 *
 * Direct construction is private to prevent invalid states. Use factory method:
 * - `Polygon2.make()` - Create from three or more vertices.
 */
class Polygon2 {
    readonly #vertices: PolygonVertices<Vec2>;

    /** Private constructor. Use Polygon2.make() instead. */
    private constructor(vertices: PolygonVertices<Vec2>) {
        this.#vertices = vertices;
    }

    /** Checks if a point lies on the polygon's boundary. */
    vecOnBoundary(p: Vec2): boolean {
        for (let i = 0; i < this.#vertices.length; i++) {
            const a = this.#vertices[i];
            const b = this.#vertices[(i + 1) % this.#vertices.length];
            if (pointOnSegment2(a, b, p)) return true;
        }
        return false;
    }

    /**
     * Checks if a point is contained within the polygon (including boundary).
     * Uses the ray casting algorithm. Points on the boundary are considered inside.
     */
    containsVec(p: Vec2): boolean {
        if (this.vecOnBoundary(p)) {
            return true;
        }
        return this.#vecInPolygon(p);
    }

    /**
     * Checks if a rectangle is fully contained within the polygon.
     * First check all four corners of the rectangle must be inside the polygon
     * Then check no edge of the rectangle can intersect with any edge of the polygon
     */
    containsRectangle(rect: Rect2): boolean {
        const corners: Vec2[] = [
            new Vec2(rect.min.x, rect.min.y),
            new Vec2(rect.max.x, rect.min.y),
            new Vec2(rect.max.x, rect.max.y),
            new Vec2(rect.min.x, rect.max.y),
        ];

        // Check if all corners are inside
        for (const c of corners) {
            if (!this.containsVec(c)) return false;
        }

        const rEdges = rect.edges();

        // Check if any edges intersect
        for (let i = 0; i < this.#vertices.length; i++) {
            const a = this.#vertices[i];
            const b = this.#vertices[(i + 1) % this.#vertices.length];

            for (const [c, d] of rEdges) {
                if (segmentsIntersect2(a, b, c, d)) return false;
            }
        }

        return true;
    }

    /** Ray casting algorithm for point-in-polygon test. */
    #vecInPolygon(p: Vec2): boolean {
        let inside = false;
        for (
            let i = 0, j = this.#vertices.length - 1;
            i < this.#vertices.length;
            j = i++
        ) {
            const xi = this.#vertices[i].x,
                yi = this.#vertices[i].y;
            const xj = this.#vertices[j].x,
                yj = this.#vertices[j].y;

            const intersect =
                yi > p.y !== yj > p.y &&
                p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;

            if (intersect) inside = !inside;
        }
        return inside;
    }

    /**
     * Creates a polygon from an array of vertices.
     *
     * ```ts
     * const square = unwrap(Polygon2.make([
     *   new Vec2(0, 0),
     *   new Vec2(10, 0),
     *   new Vec2(10, 10),
     *   new Vec2(0, 10)
     * ]));
     * ```
     */
    static make(vertices: Vec2[]): Result<Polygon2> {
        if (vertices.length < 3) {
            return failure(
                `POLYGON2: vertices must contain three or more elements`
            );
        }
        return success(new Polygon2(vertices as PolygonVertices<Vec2>));
    }
}

export default Polygon2;
