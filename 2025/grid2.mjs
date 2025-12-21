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
        // ehhh not safe
        this.cols = grid[0].length;
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
        if (vec.y < 0 || vec.y >= this.rows) return true;
        if (vec.x < 0 || vec.x >= this.cols) return true;
        return false;
    }

    copy() {
        return new Grid2(JSON.parse(JSON.stringify(this.data)));
    }
}

export default Grid2;
