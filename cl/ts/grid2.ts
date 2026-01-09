import Vec2 from "./vec2";
import Printable from "./printable";

export const UP = Object.freeze(new Vec2(0, -1));
export const RIGHT = Object.freeze(new Vec2(1, 0));
export const DOWN = Object.freeze(new Vec2(0, 1));
export const LEFT = Object.freeze(new Vec2(-1, 0));
export const UPRIGHT = Object.freeze(new Vec2(1, -1));
export const UPLEFT = Object.freeze(new Vec2(-1, -1));
export const DOWNRIGHT = Object.freeze(new Vec2(1, 1));
export const DOWNLEFT = Object.freeze(new Vec2(-1, 1));

export const STRAIGHT_DIRECTIONS = [UP, RIGHT, DOWN, LEFT];
export const DIAGONAL_DIRECTIONS = [UPRIGHT, UPLEFT, DOWNLEFT, DOWNRIGHT];
export const ALL_DIRECTIONS = [...STRAIGHT_DIRECTIONS, ...DIAGONAL_DIRECTIONS];

/**
 * 2D grid with fixed dimensions and neighbor iteration utilities.
 */
class Grid2<T> extends Printable {
    #data: T[];

    readonly #width: number;
    readonly #height: number;
    readonly #size: number;

    #vecCache: Map<number, Vec2>;

    constructor(data: T[], width: number, height: number) {
        super();
        this.#data = data;
        this.#width = width;
        this.#height = height;
        this.#size = width * height;
        this.#vecCache = new Map();
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get size() {
        return this.#size;
    }

    getFromIdx(idx: number): T {
        return this.#data[idx];
    }

    getFromCoords(x: number, y: number): T {
        return this.getFromIdx(this.coordsToIdx(x, y));
    }

    getFromVec(vec: Vec2): T {
        return this.getFromIdx(this.vecToIdx(vec));
    }

    setFromIdx(idx: number, value: T): void {
        this.#data[idx] = value;
    }

    setFromCoords(x: number, y: number, value: T): void {
        return this.setFromIdx(this.coordsToIdx(x, y), value);
    }

    setFromVec(vec: Vec2, value: T): void {
        return this.setFromIdx(this.vecToIdx(vec), value);
    }

    coordsToIdx(x: number, y: number) {
        if (this.outOfBoundsEx(x, y)) {
            // TODO: dont throw error
            throw new Error(
                `out of bounds: (${x}, ${y}) for grid ${this.width}×${this.height}`
            );
        }
        return y * this.width + x;
    }

    vecToIdx(vec: Vec2) {
        return this.coordsToIdx(vec.x, vec.y);
    }

    idxToCoords(idx: number) {
        const x = idx % this.width;
        const y = Math.floor(idx / this.width);
        return [x, y] as const;
    }

    idxToVec(idx: number) {
        let v = this.#vecCache.get(idx);
        if (v === undefined) {
            const [x, y] = this.idxToCoords(idx);
            v = Object.freeze(new Vec2(x, y));
            this.#vecCache.set(idx, v);
        }
        return v;
    }

    outOfBoundsX(x: number) {
        return x < 0 || x >= this.width;
    }

    outOfBoundsY(y: number) {
        return y < 0 || y >= this.height;
    }

    outOfBoundsEx(x: number, y: number) {
        return this.outOfBoundsX(x) || this.outOfBoundsY(y);
    }

    outOfBounds(vec: Vec2) {
        return this.outOfBoundsEx(vec.x, vec.y);
    }

    forEachDirection(
        origin: Vec2,
        fn: (val: T, next: Vec2, dir: Vec2) => void,
        directions: Vec2[] = ALL_DIRECTIONS
    ) {
        for (const dir of directions) {
            const next = Vec2.add(origin, dir);
            if (this.outOfBounds(next)) continue;
            fn(this.getFromVec(next), next, dir);
        }
    }

    forSome(fn: (val: T, idx: number) => boolean) {
        for (let i = 0; i < this.size; i++) {
            if (fn(this.getFromIdx(i), i)) return;
        }
    }

    forEach(fn: (val: T, idx: number) => void) {
        this.forSome((...args) => {
            fn(...args);
            return Grid2.CONTINUE_ITER;
        });
    }

    findOne(predicate: (val: T, idx: number) => boolean) {
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

    toString() {
        let out = "";
        for (let i = 0; i < this.size; i++) {
            out += " " + this.getFromIdx(i);
            if ((i + 1) % this.width === 0) {
                out += "\n";
            }
        }
        return out;
    }

    copy() {
        return new Grid2(structuredClone(this.#data), this.width, this.height);
    }

    static fromNested<T>(nested: any[][]) {
        return new Grid2<T>(
            nested.flat() as T[],
            nested[0].length,
            nested.length
        );
    }

    static CONTINUE_ITER = false;
    static STOP_ITER = true;
}

export default Grid2;
