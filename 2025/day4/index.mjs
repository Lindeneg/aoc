import day from "../day.mjs";
import Grid2 from "../grid2.mjs";

const PAPERROLL = "@";
const EMPTY = ".";
const MAX_ADJACENT_PAPERROLLS = 4;

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
    const grid = new Grid2(
        arrBuf
            .toString()
            .trimEnd()
            .split(split)
            .map((e) => e.split(""))
    );
    return grid;
});

day4.setPart1((grid) => {
    grid.forEach((value, vec) => {
        if (value === EMPTY) return;
        if (canRemovePaperRoll(grid, vec)) {
            day4.answers.part1++;
        }
    });
});

day4.setPart2((grid) => {
    let newGrid = grid.copy();
    while (true) {
        let removedCount = 0;
        grid.forEach((value, vec) => {
            if (value === EMPTY) return;
            if (canRemovePaperRoll(grid, vec)) {
                day4.answers.part2++;
                newGrid.set(vec, EMPTY);
                removedCount++;
            }
        });
        if (removedCount <= 0) break;
        grid = newGrid.copy();
    }
});

function canRemovePaperRoll(
    grid,
    vec,
    maxAdjacentRolls = MAX_ADJACENT_PAPERROLLS
) {
    return adjacentPaperRollCount(grid, vec) < maxAdjacentRolls;
}

function adjacentPaperRollCount(grid, origin) {
    let adjacentPaperRolls = 0;
    grid.forEachDirection(origin, (val) => {
        if (val === PAPERROLL) adjacentPaperRolls++;
    });
    return adjacentPaperRolls;
}

await day4.examples();
await day4.run();
