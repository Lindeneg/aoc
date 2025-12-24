import day from "../day.mjs";
import Grid2, {LEFT, RIGHT} from "../grid2.mjs";

const START = "S";
const SPLITTER = "^";

const day7 = day(
    {
        path: "./input",
        expected: 1662,
    },
    {
        path: "./input",
        expected: 40941112789504n,
    },
    {
        path: "./example-input",
        expected1: 21,
        expected2: 40n,
    }
);

day7.setTransform((arrBuf, split) => {
    const buf = arrBuf
        .toString()
        .trimEnd()
        .split(split)
        .map((e) => e.split(""));
    const grid = new Grid2(buf);
    const startPos = grid.search((cur) => cur === START);
    return [grid, startPos];
});

function incMapEl(map, key, count) {
    if (map.has(key)) {
        const value = map.get(key);
        map.set(key, value + count);
        return;
    }
    map.set(key, count);
}

day7.setOnce(([grid, startPos]) => {
    let current = new Map([[startPos.x, 1n]]);
    for (let y = startPos.y + 1; y < grid.rows; y++) {
        const next = new Map();
        for (const [x, count] of current.entries()) {
            const value = grid.getEx(x, y);
            if (value === SPLITTER) {
                const [left, right] = [x + LEFT.x, x + RIGHT.x];
                if (!grid.outOfBoundsX(left)) incMapEl(next, left, count);
                if (!grid.outOfBoundsX(right)) incMapEl(next, right, count);
                day7.answers.part1++;
            } else {
                incMapEl(next, x, count);
            }
        }
        current = next;
    }
    day7.answers.part2 = [...current.values()].reduce((a, b) => a + b, 0n);
});

await day7.examples();
await day7.run();
