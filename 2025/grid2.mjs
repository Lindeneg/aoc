import Vec2 from "./vec2.mjs";

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

class Grid2 {
    constructor(grid) {
        this.data = grid;
        this.rows = grid.length;
        this.cols = grid[0].length;
        this.entryCount = this.rows * this.cols;
    }

    getEx(col, row) {
        return this.data[row][col];
    }

    get(vec) {
        return this.getEx(vec.x, vec.y);
    }

    setEx(col, row, value) {
        this.data[row][col] = value;
    }

    set(vec, value) {
        this.data[vec.y][vec.x] = value;
    }

    forEach(fn) {
        this.forEachVec((vec) => fn(this.get(vec), vec));
    }

    forEachVec(fn) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                fn(new Vec2(col, row));
            }
        }
    }

    forEachDirection(origin, fn, directions = ALL_DIRECTIONS) {
        for (const dir of directions) {
            const newVec = Vec2.add(origin, dir);
            if (this.outOfBounds(newVec)) continue;
            fn(this.get(newVec));
        }
    }

    outOfBounds(vec) {
        return this.outOfBoundsX(vec.x) || this.outOfBoundsY(vec.y);
    }

    outOfBoundsX(x) {
        if (x < 0 || x >= this.cols) return true;
        return false;
    }

    outOfBoundsY(y) {
        if (y < 0 || y >= this.rows) return true;
        return false;
    }

    find(predicate) {
        const result = this.findAll(predicate, 1);
        if (!result.length) return null;
        return result[0];
    }

    findAll(predicate, limit = this.entryCount) {
        const vecs = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const pos = new Vec2(col, row);
                if (predicate(this.get(pos), pos)) {
                    vecs.push(pos);
                    if (vecs.length >= limit) return vecs;
                }
            }
        }
        return vecs;
    }

    copy() {
        return new Grid2(JSON.parse(JSON.stringify(this.data)));
    }

    print() {
        for (let row = 0; row < this.rows; row++) {
            let str = "";
            for (let col = 0; col < this.cols; col++) {
                str += this.getEx(col, row);
            }
            console.log(str);
        }
        console.log();
    }
}

export default Grid2;
