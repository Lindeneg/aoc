import Vec2 from "./vec2";
import {success, failure, type Result} from "./result";
import type {Point} from "./types";

export interface Compressible<T extends Point> {
    /** Compresses a point to a smaller coordinate space. */
    compress(v: T): Result<T>;

    /** Decompresses a point back to its original coordinates. */
    decompress(v: T): T;
}

/**
 * Coordinate compression utility for 2D vectors.
 *
 * Maps sparse coordinate spaces to dense integer indices. Useful when you have
 * a small number of distinct coordinates spread across a large range.
 *
 * Basic usage
 * ```ts
 * // Sparse coordinates: only using x=[0, 1000, 5000] and y=[0, 2000, 10000]
 * const points = [
 *   new Vec2(0, 0),
 *   new Vec2(1000, 2000),
 *   new Vec2(5000, 10000)
 * ];
 *
 * const compressor = new Vec2Compressor(points);
 *
 * // Compress to small indices
 * const compressed = unwrap(compressor.compress(new Vec2(1000, 2000)));
 * console.log(compressed); // Vec2(1, 1) - mapped to indices
 *
 * // Decompress back to original
 * const original = compressor.decompress(compressed);
 * console.log(original); // Vec2(1000, 2000)
 * ```
 *
 * Grid with sparse coordinates
 * ```ts
 * // Instead of creating a 1000000x1000000 grid,
 * // compress to a small NxM grid
 * const sparsePoints = [
 *   new Vec2(0, 0),
 *   new Vec2(999999, 999999),
 *   new Vec2(500000, 500000)
 * ];
 *
 * const compressor = new Vec2Compressor(sparsePoints);
 * // Now you can use a 3x3 grid instead of 1000000x1000000
 * ```
 */
export class Vec2Compressor implements Compressible<Vec2> {
    #xs: number[];
    #ys: number[];

    /**
     * Creates a new coordinate compressor.
     *
     * Extracts unique x and y coordinates, sorts them, and builds lookup tables.
     * Compression maps each coordinate to its index in the sorted unique list.
     */
    constructor(points: Vec2[]) {
        this.#xs = [...new Set(points.map((p) => p.x))].sort((a, b) => a - b);
        this.#ys = [...new Set(points.map((p) => p.y))].sort((a, b) => a - b);
    }

    /**
     * Compresses a vector to small integer indices.
     *
     * The compressed point's x and y values are indices into the sorted unique coordinate lists.
     * Only points with coordinates that were in the original points array can be compressed.
     */
    compress(p: Vec2): Result<Vec2> {
        const xResult = this.#binarySearch(this.#xs, p.x);
        if (!xResult.ok) return xResult;
        const yResult = this.#binarySearch(this.#ys, p.y);
        if (!yResult.ok) return yResult;
        return success(new Vec2(xResult.data, yResult.data));
    }

    /**
     * Decompresses a vector back to original coordinates.
     *
     * Uses the compressed x and y values as indices to look up the original coordinates.
     * No bounds checking is performed - ensure p was produced by compress().
     */
    decompress(p: Vec2): Vec2 {
        return new Vec2(this.#xs[p.x], this.#ys[p.y]);
    }

    /** Binary search to find the index of a value in a sorted array. */
    #binarySearch(arr: number[], v: number): Result<number> {
        let lo = 0,
            hi = arr.length - 1;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (arr[mid] === v) return success(mid);
            if (arr[mid] < v) lo = mid + 1;
            else hi = mid - 1;
        }
        return failure(`VEC2COMPRESSOR: value ${v} not found in compressor`);
    }
}
