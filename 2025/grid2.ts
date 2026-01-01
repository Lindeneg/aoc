import Vec2 from "./vec2";
import Printable from "./printable";

export const UP = new Vec2(0, -1);
export const RIGHT = new Vec2(1, 0);
export const DOWN = new Vec2(0, 1);
export const LEFT = new Vec2(-1, 0);
export const UPRIGHT = new Vec2(1, -1);
export const UPLEFT = new Vec2(-1, -1);
export const DOWNRIGHT = new Vec2(1, 1);
export const DOWNLEFT = new Vec2(-1, 1);

export const STRAIGHT_DIRECTIONS = [UP, RIGHT, DOWN, LEFT];
export const DIAGONAL_DIRECTIONS = [UPRIGHT, UPLEFT, DOWNLEFT, DOWNRIGHT];
export const ALL_DIRECTIONS = [...STRAIGHT_DIRECTIONS, ...DIAGONAL_DIRECTIONS];

abstract class Grid2<T> extends Printable {
    #data: T[];
    #width: number;
    #height: number;
    #entryCount: number;

    constructor(data: T[], width: number, height: number) {
        super();
        this.#data = data;
        this.#width = width;
        this.#height = height;
        this.#entryCount = width * height;
    }

    protected get data() {
        return this.#data;
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get entryCount() {
        return this.#entryCount;
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
        return [x, y];
    }

    idxToVec(idx: number) {
        return new Vec2(...this.idxToCoords(idx));
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

    forEachSliceCoords(
        fn: (val: T, idx: number) => void,
        minX: number,
        minY: number,
        maxX: number,
        maxY: number
    ) {
        minX = Math.max(0, minX);
        minY = Math.max(0, minY);
        maxX = Math.min(this.width - 1, maxX);
        maxY = Math.min(this.height - 1, maxY);

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const idx = this.coordsToIdx(x, y);
                fn(this.getFromIdx(idx), idx);
            }
        }
    }

    forEachSliceVecs(fn: (val: T, idx: number) => void, min: Vec2, max: Vec2) {
        return this.forEachSliceCoords(fn, min.x, min.y, max.x, max.y);
    }

    findOneInSlice(
        minX: number,
        minY: number,
        maxX: number,
        maxY: number,
        predicate: (val: T, idx: number) => boolean
    ) {
        let found: number = -1;
        this.forEachSliceCoords(
            (val, idx) => {
                if (found) return;
                if (predicate(val, idx)) found = idx;
            },
            minX,
            minY,
            maxX,
            maxY
        );
        return found;
    }

    findManyInSlice(
        minX: number,
        minY: number,
        maxX: number,
        maxY: number,
        predicate: (val: T, idx: number) => boolean,
        limit = Infinity
    ): number[] {
        const result: number[] = [];
        this.forEachSliceCoords(
            (val, idx) => {
                if (result.length >= limit) return;
                if (predicate(val, idx)) result.push(idx);
            },
            minX,
            minY,
            maxX,
            maxY
        );
        return result;
    }

    renderSliceCoords(minX: number, minY: number, maxX: number, maxY: number) {
        let out = "";
        this.forEachSliceCoords(
            (value, idx) => {
                const vec = this.idxToVec(idx);
                out += value;
                if (vec.x === maxX) out += "\n";
            },
            minX,
            minY,
            maxX,
            maxY
        );
        return out;
    }

    renderSlice(min: Vec2, max: Vec2) {
        return this.renderSliceCoords(min.x, min.y, max.x, max.y);
    }

    highlightArea(a: Vec2, b: Vec2, value = "#", padding = 0) {
        const minX = Math.min(a.x, b.x) - padding;
        const maxX = Math.max(a.x, b.x) + padding;
        const minY = Math.min(a.y, b.y) - padding;
        const maxY = Math.max(a.y, b.y) + padding;

        let out = "";

        this.forEachSliceCoords(
            (cell, idx) => {
                const vec = this.idxToVec(idx);
                if (
                    vec.x >= a.x &&
                    vec.x <= b.x &&
                    vec.y >= a.y &&
                    vec.y <= b.y
                ) {
                    out += value;
                } else {
                    out += cell;
                }

                if (vec.x === maxX) out += "\n";
            },
            minX,
            minY,
            maxX,
            maxY
        );

        return out;
    }
}

export class DenseGrid2<T> extends Grid2<T> {
    #vecCache: Array<Vec2>;

    constructor(data: T[], width: number, height: number) {
        super(data, width, height);

        this.#vecCache = new Array(width * height);
    }

    idxToVec(idx: number) {
        let v = this.#vecCache[idx];
        if (v === undefined) {
            const [x, y] = this.idxToCoords(idx);
            v = Object.freeze(new Vec2(x, y));
            this.#vecCache[idx] = v;
        }
        return v;
    }

    forEach(fn: (val: T, idx: number) => void) {
        this.forEachSliceCoords(fn, 0, 0, this.width, this.height);
    }

    toString() {
        let out = "";
        for (let i = 0; i < this.entryCount; i++) {
            out += " " + this.getFromIdx(i);
            if ((i + 1) % this.width === 0) {
                out += "\n";
            }
        }
        return out;
    }

    copy() {
        return new DenseGrid2(
            structuredClone(this.data),
            this.width,
            this.height
        );
    }

    static fromNested<T>(nested: any[][]) {
        return new DenseGrid2<T>(
            nested.flat() as T[],
            nested[0].length,
            nested.length
        );
    }
}
