import Vec2 from "./vec2";
import Rect from "./rect";
import {pointOnSegment2, segmentsIntersect2} from "./geometry";

class Polygon2 {
    constructor(public readonly vertices: Vec2[]) {
        if (vertices.length < 3) {
            throw new Error("Polygon must have at least 3 vertices");
        }
    }

    vecOnBoundary(p: Vec2): boolean {
        for (let i = 0; i < this.vertices.length; i++) {
            const a = this.vertices[i];
            const b = this.vertices[(i + 1) % this.vertices.length];
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

        for (let i = 0; i < this.vertices.length; i++) {
            const a = this.vertices[i];
            const b = this.vertices[(i + 1) % this.vertices.length];

            for (const [c, d] of rEdges) {
                if (segmentsIntersect2(a, b, c, d)) return false;
            }
        }

        return true;
    }

    #vecInPolygon(p: Vec2): boolean {
        let inside = false;
        for (
            let i = 0, j = this.vertices.length - 1;
            i < this.vertices.length;
            j = i++
        ) {
            const xi = this.vertices[i].x,
                yi = this.vertices[i].y;
            const xj = this.vertices[j].x,
                yj = this.vertices[j].y;

            const intersect =
                yi > p.y !== yj > p.y &&
                p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;

            if (intersect) inside = !inside;
        }
        return inside;
    }
}

export default Polygon2;
