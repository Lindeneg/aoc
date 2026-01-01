import Day from "../day";
import type Vec2 from "../vec2";
import {DenseGrid2, LEFT, RIGHT} from "../grid2";

type Grid = DenseGrid2<string>;

const START = "S";
const SPLITTER = "^";

function incMapEl(map: Map<number, bigint>, key: number, count: bigint) {
    if (map.has(key)) {
        const value = map.get(key)!;
        map.set(key, value + count);
        return;
    }
    map.set(key, count);
}

const day7 = new Day(
    (part, [grid, startPos]: [Grid, Vec2]) => {
        let answer = 0n;
        let current = new Map([[startPos.x, 1n]]);
        for (let y = startPos.y + 1; y < grid.height; y++) {
            const next = new Map();
            for (const [x, count] of current.entries()) {
                const value = grid.getFromCoords(x, y);
                if (value === SPLITTER) {
                    const [left, right] = [x + LEFT.x, x + RIGHT.x];
                    if (!grid.outOfBoundsX(left)) incMapEl(next, left, count);
                    if (!grid.outOfBoundsX(right)) incMapEl(next, right, count);
                    if (part.one) answer++;
                } else {
                    incMapEl(next, x, count);
                }
            }
            current = next;
        }
        if (part.two) return [...current.values()].reduce((a, b) => a + b, 0n);
        return answer;
    },
    [1662n, 40941112789504n],
    [21n, 40n]
).setPostTransform((transformed) => {
    const grid = DenseGrid2.fromNested<string>(
        transformed.map((e) => e.split(""))
    );
    const startPosIdx = grid.findOne((cur) => cur === START);
    return [grid, grid.idxToVec(startPosIdx)];
});

(async () => {
    await day7.examples();
    await day7.solve();
})();
