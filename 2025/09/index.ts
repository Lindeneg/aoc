import {Day, Rect2, Vec2, Polygon2, Vec2Compressor, unwrap} from "../../cl";

type Data = [Polygon2, Vec2[], Vec2Compressor | null];

const day9 = new Day(
    (part, [poly, vecs, compressor]: Data) => {
        if (part.two && !compressor) return 0;
        let answer = 0;

        const sortedIndices = Array.from(
            {length: vecs.length},
            (_, i) => i
        ).sort((i, j) => {
            const a = vecs[i];
            const b = vecs[j];
            return a.x + a.y - (b.x + b.y);
        });

        for (let ii = 0; ii < sortedIndices.length; ii++) {
            const i = sortedIndices[ii];
            for (let jj = ii + 1; jj < sortedIndices.length; jj++) {
                const j = sortedIndices[jj];
                const a = vecs[i];
                const b = vecs[j];

                const maxPossibleArea =
                    Math.abs(b.x - a.x + 1) * Math.abs(b.y - a.y + 1);
                if (maxPossibleArea <= answer) continue;

                const rect = unwrap(Rect2.fromOppositePoints(a, b));
                if (
                    part.two &&
                    !poly.containsRectangle(
                        unwrap(Rect2.compress(rect, compressor!))
                    )
                ) {
                    continue;
                }
                answer = Math.max(answer, rect.areaInclusive());
            }
        }
        return answer;
    },
    [4776100539, 1476550548],
    [50, 24]
).setPostTransform((transformed, part) => {
    const vecs = transformed.map(
        (line) => new Vec2(...line.split(",").map(Number))
    );

    if (part.one) return [unwrap(Polygon2.make(vecs)), vecs, null];

    const compressor = new Vec2Compressor(vecs);
    return [
        unwrap(Polygon2.make(vecs.map((e) => unwrap(compressor.compress(e))))),
        vecs,
        compressor,
    ];
});

(async () => {
    console.log(await day9.examples());
    console.log(await day9.solve());
})();
