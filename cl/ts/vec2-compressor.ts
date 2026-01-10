import Vec2 from "./vec2";
import {success, failure} from "./result";
import type {Compressible, Result} from "./types";

class Vec2Compressor implements Compressible<Vec2> {
    #xs: number[];
    #ys: number[];

    constructor(points: Vec2[]) {
        this.#xs = [...new Set(points.map((p) => p.x))].sort((a, b) => a - b);
        this.#ys = [...new Set(points.map((p) => p.y))].sort((a, b) => a - b);
    }

    compress(p: Vec2): Result<Vec2> {
        const xResult = this.#binarySearch(this.#xs, p.x);
        if (!xResult.ok) return xResult;
        const yResult = this.#binarySearch(this.#ys, p.y);
        if (!yResult.ok) return yResult;
        return success(new Vec2(xResult.data, yResult.data));
    }

    decompress(p: Vec2): Vec2 {
        return new Vec2(this.#xs[p.x], this.#ys[p.y]);
    }

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

export default Vec2Compressor;
