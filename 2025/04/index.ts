import Day from "../day";
import {DenseGrid2} from "../grid2";

type Grid = DenseGrid2<string>;

const PAPERROLL = "@";
const EMPTY = ".";
const MAX_ADJACENT_PAPERROLLS = 4;

function adjacentCount(grid: Grid, originIdx: number) {
    const origin = grid.idxToVec(originIdx);
    let adjacentPaperRolls: number = 0;
    grid.forEachDirection(origin, (val) => {
        if (val === PAPERROLL) adjacentPaperRolls++;
    });
    return adjacentPaperRolls;
}

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
    return DenseGrid2.fromNested(transformed.map((e) => e.split("")));
});

(async () => {
    await day4.examples();
    await day4.solve();
})();
