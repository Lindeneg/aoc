import Vec2 from "./vec2";
import Printable from "./printable";
import {emptySuccess, failure, success} from "./result";
import type {Result, Coordinates2} from "./types";

export const UP = Object.freeze(new Vec2(0, -1));
export const RIGHT = Object.freeze(new Vec2(1, 0));
export const DOWN = Object.freeze(new Vec2(0, 1));
export const LEFT = Object.freeze(new Vec2(-1, 0));
export const UPRIGHT = Object.freeze(new Vec2(1, -1));
export const UPLEFT = Object.freeze(new Vec2(-1, -1));
export const DOWNRIGHT = Object.freeze(new Vec2(1, 1));
export const DOWNLEFT = Object.freeze(new Vec2(-1, 1));

export const STRAIGHT_DIRECTIONS = [UP, RIGHT, DOWN, LEFT] as const;
export const DIAGONAL_DIRECTIONS = [
    UPRIGHT,
    UPLEFT,
    DOWNLEFT,
    DOWNRIGHT,
] as const;
export const ALL_DIRECTIONS = [
    ...STRAIGHT_DIRECTIONS,
    ...DIAGONAL_DIRECTIONS,
] as const;

/**
 * 2D grid with fixed dimensions and neighbor iteration utilities.
 *
 * Constructor calling is not allowed, since there exist a state
 * where a grid is considered invalid and thus should not be constructed.
 * One example is when the size is greater than the data capacity.
 *
 * Instead make use of:
 * `Grid2.make`, `Grid2.fromNested` or `Grid2.fromNestedWithPadding`
 *
 * All of which returns a `Result` object.
 */
class Grid2<T> extends Printable {
    readonly #width: number;
    readonly #height: number;
    readonly #size: number;
    readonly #data: T[];
    readonly #vecCache: Map<number, Vec2>;

    private constructor(data: T[], width: number, height: number) {
        super();
        this.#width = width;
        this.#height = height;
        this.#size = width * height;
        this.#data = data;
        this.#vecCache = new Map();
    }

    get width(): number {
        return this.#width;
    }

    get height(): number {
        return this.#height;
    }

    get size(): number {
        return this.#size;
    }

    getFromIdx(idx: number): Result<T> {
        if (idx < 0 || idx >= this.#data.length)
            return failure(
                `GRID2: invalid index ${idx} on grid data size ${this.#data.length}`
            );
        return success(this.#data[idx]);
    }

    getFromCoords(x: number, y: number): Result<T> {
        const result = this.coordsToIdx(x, y);
        if (!result.ok) return result;
        return this.getFromIdx(result.data);
    }

    getFromVec(vec: Vec2): Result<T> {
        const result = this.vecToIdx(vec);
        if (!result.ok) return result;
        return this.getFromIdx(result.data);
    }

    setFromIdx(idx: number, value: T): Result {
        if (idx < 0 || idx >= this.#data.length)
            return failure(
                `GRID2: invalid index ${idx} on grid data size ${this.#data.length}`
            );
        this.#data[idx] = value;
        return emptySuccess();
    }

    setFromCoords(x: number, y: number, value: T): Result {
        const result = this.coordsToIdx(x, y);
        if (!result.ok) return result;
        return this.setFromIdx(result.data, value);
    }

    setFromVec(vec: Vec2, value: T): Result {
        const result = this.vecToIdx(vec);
        if (!result.ok) return result;
        return this.setFromIdx(result.data, value);
    }

    coordsToIdx(x: number, y: number): Result<number> {
        if (this.outOfBoundsEx(x, y)) {
            return failure(
                `GRID2: out of bounds: (${x}, ${y}) for grid ${this.width}×${this.height}`
            );
        }
        return success(y * this.width + x);
    }

    vecToIdx(vec: Vec2): Result<number> {
        return this.coordsToIdx(vec.x, vec.y);
    }

    idxToCoords(idx: number): Coordinates2 {
        const x = idx % this.width;
        const y = Math.floor(idx / this.width);
        return [x, y] as const;
    }

    idxToVec(idx: number): Vec2 {
        let v = this.#vecCache.get(idx);
        if (v === undefined) {
            const [x, y] = this.idxToCoords(idx);
            v = Object.freeze(new Vec2(x, y));
            this.#vecCache.set(idx, v);
        }
        return v;
    }

    outOfBoundsX(x: number): boolean {
        return x < 0 || x >= this.width;
    }

    outOfBoundsY(y: number): boolean {
        return y < 0 || y >= this.height;
    }

    outOfBoundsEx(x: number, y: number): boolean {
        return this.outOfBoundsX(x) || this.outOfBoundsY(y);
    }

    outOfBounds(vec: Vec2): boolean {
        return this.outOfBoundsEx(vec.x, vec.y);
    }

    forEachDirection(
        origin: Vec2,
        fn: (val: T, next: Vec2, dir: Vec2) => void,
        directions: readonly Vec2[] = ALL_DIRECTIONS
    ): void {
        for (const dir of directions) {
            const next = origin.add(dir);
            const result = this.getFromVec(next);
            if (result.ok) fn(result.data, next, dir);
        }
    }

    forSome(fn: (val: T, idx: number) => boolean): void {
        for (let i = 0; i < this.size; i++) {
            const result = this.getFromIdx(i);
            if (!result.ok) continue;
            if (fn(result.data, i)) return;
        }
    }

    forEach(fn: (val: T, idx: number) => void): void {
        this.forSome((...args) => {
            fn(...args);
            return Grid2.CONTINUE_ITER;
        });
    }

    findOne(predicate: (val: T, idx: number) => boolean): number {
        let found: number = -1;
        this.forSome((val, idx) => {
            if (predicate(val, idx)) {
                found = idx;
                return Grid2.STOP_ITER;
            }
            return Grid2.CONTINUE_ITER;
        });
        return found;
    }

    findMany(
        predicate: (val: T, idx: number) => boolean,
        limit = Infinity
    ): number[] {
        const result: number[] = [];
        this.forSome((val, idx) => {
            if (result.length >= limit) return Grid2.STOP_ITER;
            if (predicate(val, idx)) result.push(idx);
            return Grid2.CONTINUE_ITER;
        });
        return result;
    }

    toString(): string {
        let out = "";
        for (let i = 0; i < this.size; i++) {
            out += " " + this.getFromIdx(i);
            if ((i + 1) % this.width === 0) {
                out += "\n";
            }
        }
        return out;
    }

    copy(): Grid2<T> {
        return new Grid2(structuredClone(this.#data), this.width, this.height);
    }

    static make<T>(data: T[], width: number, height: number): Result<Grid2<T>> {
        if (width * height > data.length) {
            return failure(
                `GRID2: cannot make grid ${width}x${height} with data capacity ${data.length}`
            );
        }
        return success(new Grid2(data, width, height));
    }

    /**
     * Creates a new grid from a nested array but does not
     * garautuee that `grid.size === data.length`. Either make sure
     * your nested array is padded or simply use `grid.FromNestedWithPadding`
     * */
    static fromNested<T>(nested: T[][]): Result<Grid2<T>> {
        return Grid2.make(nested.flat(), nested[0].length, nested.length);
    }

    /**
     * Creates a new grid from a nested array and ensures
     * the dimensions are the same across all nested arrays
     * such that we can garautuee `grid.size === data.length`
     * */
    static fromNestedWithPadding<T>(
        data: T[][],
        defaultValue: T
    ): Result<Grid2<T>> {
        let cols = 0;
        for (let y = 0; y < data.length; y++) {
            if (data[y].length > cols) cols = data[y].length;
        }
        for (let y = 0; y < data.length; y++) {
            let length = data[y].length;
            if (length >= cols) continue;
            for (; length < cols; length++) {
                data[y].push(defaultValue);
            }
        }
        return Grid2.make(data.flat(), cols, data.length);
    }

    static CONTINUE_ITER = false;
    static STOP_ITER = true;
}

export default Grid2;
