import {Day, Rect, Vec2, Polygon2, Vec2Compressor} from "../../cl";

type Data = [Polygon2, Vec2[], Vec2Compressor];

const day9 = new Day(
    (part, [poly, vecs, compressor]: Data) => {
        let answer = 0;
        for (let i = 0; i < vecs.length; i++) {
            for (let j = i + 1; j < vecs.length; j++) {
                const a = vecs[i];
                const b = vecs[j];
                const rect = Rect.fromOppositePoints(a, b);
                if (
                    part.two &&
                    !poly.containsRectangle(Rect.compress(rect, compressor))
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
).setPostTransform((transformed) => {
    const vecs = transformed.map(
        (line) => new Vec2(...line.split(",").map(Number))
    );
    const compressor = new Vec2Compressor(vecs);
    return [
        new Polygon2(vecs.map((e) => compressor.compress(e))),
        vecs,
        compressor,
    ];
});

(async () => {
    await day9.examples();
    await day9.solve();
})();
