import day from "../day.mjs";
import Grid2, {LEFT, RIGHT} from "../grid2.mjs";

const START = "S";
const SPLITTER = "^";

const day7 = day(solve, [1662, 40941112789504n], [21, 40n]);

day7.setTransform((arrBuf, split) => {
    const buf = arrBuf
        .toString()
        .trimEnd()
        .split(split)
        .map((e) => e.split(""));
    const grid = new Grid2(buf);
    const startPos = grid.find((cur) => cur === START);
    return [grid, startPos];
});

function solve([grid, startPos], part) {
    let answer = 0;
    let current = new Map([[startPos.x, 1n]]);
    for (let y = startPos.y + 1; y < grid.rows; y++) {
        const next = new Map();
        for (const [x, count] of current.entries()) {
            const value = grid.getEx(x, y);
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
}

function incMapEl(map, key, count) {
    if (map.has(key)) {
        const value = map.get(key);
        map.set(key, value + count);
        return;
    }
    map.set(key, count);
}

await day7.examples();
await day7.run();
