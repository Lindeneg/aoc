import type {Point2} from "./types";

export function orient2(a: Point2, b: Point2, c: Point2): number {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

export function pointOnSegment2(a: Point2, b: Point2, p: Point2): boolean {
    const cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    if (cross !== 0) return false;
    return (
        p.x >= Math.min(a.x, b.x) &&
        p.x <= Math.max(a.x, b.x) &&
        p.y >= Math.min(a.y, b.y) &&
        p.y <= Math.max(a.y, b.y)
    );
}

export function segmentsIntersect2(
    a: Point2,
    b: Point2,
    c: Point2,
    d: Point2
): boolean {
    const o1 = orient2(a, b, c);
    const o2 = orient2(a, b, d);
    const o3 = orient2(c, d, a);
    const o4 = orient2(c, d, b);
    if ((o1 > 0 && o2 < 0) || (o1 < 0 && o2 > 0)) {
        if ((o3 > 0 && o4 < 0) || (o3 < 0 && o4 > 0)) {
            return true;
        }
    }
    return false;
}
