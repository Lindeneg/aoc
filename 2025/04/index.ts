import {Day, Grid2, unwrap} from "../../cl";

type Grid = Grid2<string>;

const PAPERROLL = "@";
const EMPTY = ".";
const MAX_ADJACENT_PAPERROLLS = 4;

const day4 = new Day(
    (part, grid: Grid) => {
        let answer = 0;

        if (part.one) {
            grid.forEach((value, idx) => {
                if (value === EMPTY) return;
                if (adjacentCount(grid, idx) < MAX_ADJACENT_PAPERROLLS) {
                    answer++;
                }
            });
        } else if (part.two) {
            let newGrid = grid.copy();
            while (true) {
                let removedCount = 0;
                grid.forEach((value, idx) => {
                    if (value === EMPTY) return;
                    if (adjacentCount(grid, idx) < MAX_ADJACENT_PAPERROLLS) {
                        answer++;
                        newGrid.setFromIdx(idx, EMPTY);
                        removedCount++;
                    }
                });
                if (removedCount <= 0) break;
                grid = newGrid.copy();
            }
        }

        return answer;
    },
    [1480, 8899],
    [13, 43]
).setPostTransform((transformed) => {
    return unwrap(Grid2.fromNested(transformed.map((e) => e.split(""))));
});

function adjacentCount(grid: Grid, originIdx: number) {
    const origin = grid.idxToVec(originIdx);
    let adjacentPaperRolls: number = 0;
    grid.forEachDirection(origin, (val) => {
        if (val === PAPERROLL) adjacentPaperRolls++;
    });
    return adjacentPaperRolls;
}

(async () => {
    console.log(await day4.examples());
    console.log(await day4.solve());
})();
