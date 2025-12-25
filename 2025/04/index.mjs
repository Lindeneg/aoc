import day from "../day.mjs";
import Grid2 from "../grid2.mjs";

const PAPERROLL = "@";
const EMPTY = ".";
const MAX_ADJACENT_PAPERROLLS = 4;

const day4 = day(solve, [1480, 8899], [13, 43]);

day4.setPostTransform((transformed) => {
    return new Grid2(transformed.map((e) => e.split("")));
});

function solve(grid, part) {
    let answer = 0;

    if (part.one) {
        grid.forEach((value, vec) => {
            if (value === EMPTY) return;
            if (canRemovePaperRoll(grid, vec)) {
                answer++;
            }
        });
    } else if (part.two) {
        let newGrid = grid.copy();
        while (true) {
            let removedCount = 0;
            grid.forEach((value, vec) => {
                if (value === EMPTY) return;
                if (canRemovePaperRoll(grid, vec)) {
                    answer++;
                    newGrid.set(vec, EMPTY);
                    removedCount++;
                }
            });
            if (removedCount <= 0) break;
            grid = newGrid.copy();
        }
    }

    return answer;
}

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
