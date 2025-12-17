import day from "../day.mjs";

const PAPERROLL = "@";
const EMPTY = ".";
const MAX_ADJACENT_PAPERROLLS = 4;

const UP = [0, -1];
const RIGHT = [1, 0];
const DOWN = [0, 1];
const LEFT = [-1, 0];

const UPRIGHT = [1, -1];
const UPLEFT = [-1, -1];
const DOWNRIGHT = [1, 1];
const DOWNLEFT = [-1, 1];

const allDirections = [
    UP,
    RIGHT,
    DOWN,
    LEFT,
    UPRIGHT,
    UPLEFT,
    DOWNRIGHT,
    DOWNLEFT,
];

function adjacentPaperRollCount(buf, x, y) {
    let adjacentPaperRolls = 0;
    for (const [m, n] of allDirections) {
        const x2 = x + m;
        const y2 = y + n;
        if (y2 < 0 || y2 >= buf.length) continue;
        if (x2 < 0 || x2 >= buf[0].length) continue;
        if (buf[y2][x2] === PAPERROLL) {
            adjacentPaperRolls++;
        }
    }
    return adjacentPaperRolls;
}

const day4 = day(
    {
        path: "./input",
        expected: 1480,
    },
    {
        path: "./input",
        expected: 8899,
    },
    {
        path: "./example-input",
        expected1: 13,
        expected2: 43,
    }
);

day4.setTransform((arrBuf, split) => {
    return arrBuf
        .toString()
        .trimEnd()
        .split(split)
        .map((e) => e.split(""));
});

day4.setPart1((buf) => {
    const rows = buf.length;
    const cols = buf[0].length;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const value = buf[y][x];
            if (value === EMPTY) continue;
            if (adjacentPaperRollCount(buf, x, y) < MAX_ADJACENT_PAPERROLLS) {
                day4.answers.part1++;
            }
        }
    }
});

day4.setPart2((buf) => {
    const rows = buf.length;
    const cols = buf[0].length;

    let newBuf = buf;
    while (true) {
        let removedCount = 0;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const value = buf[y][x];
                if (value === EMPTY) continue;
                if (
                    adjacentPaperRollCount(buf, x, y) < MAX_ADJACENT_PAPERROLLS
                ) {
                    day4.answers.part2++;
                    newBuf[y][x] = EMPTY;
                    removedCount++;
                }
            }
        }
        if (removedCount <= 0) break;
        buf = newBuf;
    }
});

await day4.examples();
await day4.run();
