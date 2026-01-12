import type {Point2} from "./types";

/**
 * Computes the 2D orientation (turn direction) of three points.
 *
 * The magnitude of the result is twice the signed area of the triangle abc.
 *
 * Returns positive if c is counter-clockwise from ab,
 * negative if clockwise and 0 if collinear
 */
export function orient2(a: Point2, b: Point2, c: Point2): number {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

/**
 * Checks if a point lies on a line segment.
 *
 * First checks collinearity using the cross product, then verifies
 * the point is within the bounding box of the segment.
 */
export function pointOnSegment2(a1: Point2, a2: Point2, p: Point2): boolean {
    const cross = (a2.x - a1.x) * (p.y - a1.y) - (a2.y - a1.y) * (p.x - a1.x);
    if (cross !== 0) return false; // Not collinear
    return (
        p.x >= Math.min(a1.x, a2.x) &&
        p.x <= Math.max(a1.x, a2.x) &&
        p.y >= Math.min(a1.y, a2.y) &&
        p.y <= Math.max(a1.y, a2.y)
    );
}

/**
 * Checks if two line segments intersect (excluding endpoints).
 *
 * Uses orientation tests to determine if the segments cross.
 * This is a strict intersection test - segments that touch at endpoints return false.
 *
 * ```ts
 * const a = new Vec2(0, 0), b = new Vec2(10, 10);
 * const c = new Vec2(0, 10), d = new Vec2(10, 0);
 * segmentsIntersect2(a, b, c, d); // true (X shape)
 *
 * const e = new Vec2(0, 0), f = new Vec2(5, 0);
 * const g = new Vec2(10, 0), h = new Vec2(15, 0);
 * segmentsIntersect2(e, f, g, h); // false (parallel, no overlap)
 * ```
 */
export function segmentsIntersect2(
    a1: Point2,
    a2: Point2,
    b1: Point2,
    b2: Point2
): boolean {
    const o1 = orient2(a1, a2, b1);
    const o2 = orient2(a1, a2, b2);
    const o3 = orient2(b1, b2, a1);
    const o4 = orient2(b1, b2, a2);
    // Segments intersect if b1 and b2 are on opposite sides of a1a2
    // AND a1 and a2 are on opposite sides of b1b2
    if ((o1 > 0 && o2 < 0) || (o1 < 0 && o2 > 0)) {
        if ((o3 > 0 && o4 < 0) || (o3 < 0 && o4 > 0)) {
            return true;
        }
    }
    return false;
}
