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
            grid = grid.copy();
            while (true) {
                const toRemove: number[] = [];
                grid.forEach((value, idx) => {
                    if (value === EMPTY) return;
                    if (adjacentCount(grid, idx) < MAX_ADJACENT_PAPERROLLS) {
                        toRemove.push(idx);
                    }
                });
                if (toRemove.length === 0) break;
                for (const idx of toRemove) {
                    unwrap(grid.setFromIdx(idx, EMPTY));
                }
                answer += toRemove.length;
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
