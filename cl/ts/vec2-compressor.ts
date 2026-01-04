import type {Compressor} from "./types";
import Vec2 from "./vec2";

class Vec2Compressor implements Compressor<Vec2> {
    #xs: number[];
    #ys: number[];

    constructor(points: Vec2[]) {
        this.#xs = [...new Set(points.map((p) => p.x))].sort((a, b) => a - b);
        this.#ys = [...new Set(points.map((p) => p.y))].sort((a, b) => a - b);
    }

    compress(p: Vec2): Vec2 {
        return new Vec2(
            this.#binarySearch(this.#xs, p.x),
            this.#binarySearch(this.#ys, p.y)
        );
    }

    decompress(p: Vec2): Vec2 {
        return new Vec2(this.#xs[p.x], this.#ys[p.y]);
    }

    #binarySearch(arr: number[], v: number): number {
        let lo = 0,
            hi = arr.length - 1;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (arr[mid] === v) return mid;
            if (arr[mid] < v) lo = mid + 1;
            else hi = mid - 1;
        }
        throw new Error(`Value ${v} not found in compressor`);
    }
}

export default Vec2Compressor;
