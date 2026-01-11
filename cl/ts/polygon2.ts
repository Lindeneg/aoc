import Vec2 from "./vec2";
import Rect from "./rect";
import {success, failure, type Result} from "./result";
import {pointOnSegment2, segmentsIntersect2} from "./geometry";

type PolygonVertices<T> = [T, T, T, ...T[]];

/**
 * Polygon utility
 *
 * Constructor calling is not allowed, since there exist a state
 * where a Polygon is considered invalid and thus should not be constructed.
 * One example is when less than three vertices are provided.
 *
 * Instead make use of `Polygon.make`.
 */
class Polygon2 {
    readonly #vertices: PolygonVertices<Vec2>;

    private constructor(vertices: PolygonVertices<Vec2>) {
        this.#vertices = vertices;
    }

    vecOnBoundary(p: Vec2): boolean {
        for (let i = 0; i < this.#vertices.length; i++) {
            const a = this.#vertices[i];
            const b = this.#vertices[(i + 1) % this.#vertices.length];
            if (pointOnSegment2(a, b, p)) return true;
        }
        return false;
    }

    containsVec(p: Vec2): boolean {
        if (this.vecOnBoundary(p)) {
            return true;
        }
        return this.#vecInPolygon(p);
    }

    containsRectangle(rect: Rect): boolean {
        const corners: Vec2[] = [
            new Vec2(rect.min.x, rect.min.y),
            new Vec2(rect.max.x, rect.min.y),
            new Vec2(rect.max.x, rect.max.y),
            new Vec2(rect.min.x, rect.max.y),
        ];

        for (const c of corners) {
            if (!this.containsVec(c)) return false;
        }

        const rEdges = rect.edges();

        for (let i = 0; i < this.#vertices.length; i++) {
            const a = this.#vertices[i];
            const b = this.#vertices[(i + 1) % this.#vertices.length];

            for (const [c, d] of rEdges) {
                if (segmentsIntersect2(a, b, c, d)) return false;
            }
        }

        return true;
    }

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
