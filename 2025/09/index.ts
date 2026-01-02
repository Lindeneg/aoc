import {Day, DenseGrid2, Vec2} from "../../cl";

type Grid = DenseGrid2<Vec2>;

const RED_TILE = "#";
const GREEN_TILE = "X";
const EMPTY_TILE = ".";
const RECTANGLE = "O";

function areaFromOppositeCorners(a: Vec2, b: Vec2) {
    const [x1, y1] = [Math.abs(a.x), Math.abs(a.y)];
    const [x2, y2] = [Math.abs(b.x), Math.abs(b.y)];
    return (x1 - x2 + 1) * (y1 - y2 + 1);
}

const day9 = new Day(
    (part, [grid, vecs]: [Grid, Vec2[]]) => {
        let answer = 0;
        for (let i = 0; i < vecs.length; i++) {
            for (let j = i + 1; j < vecs.length; j++) {
                const a = vecs[i];
                const b = vecs[j];
                if (a.x > b.x && a.y >= b.y) {
                    const area = areaFromOppositeCorners(a, b);
                    if (area > answer) answer = area;
                }
            }
        }
        return answer;
    },
    [4776100539, null],
    [50, 24]
).setPostTransform((transformed) => {
    const vecs = transformed.map(
        (line) => new Vec2(...line.split(",").map(Number))
    );

    return [new DenseGrid2([], 0, 0), vecs];
});

(async () => {
    await day9.examples(1);
    await day9.solve(1);
})();
