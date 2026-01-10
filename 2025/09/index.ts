import {Day, Rect, Vec2, Polygon2, Vec2Compressor, must} from "../../cl";

type Data = [Polygon2, Vec2[], Vec2Compressor | null];

const day9 = new Day(
    (part, [poly, vecs, compressor]: Data) => {
        if (part.two && !compressor) return 0;
        let answer = 0;
        for (let i = 0; i < vecs.length; i++) {
            for (let j = i + 1; j < vecs.length; j++) {
                const a = vecs[i];
                const b = vecs[j];
                const rect = must(Rect.fromOppositePoints(a, b));
                if (
                    part.two &&
                    !poly.containsRectangle(
                        must(Rect.compress(rect, compressor!))
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

    if (part.one) return [must(Polygon2.make(vecs)), vecs, null];

    const compressor = new Vec2Compressor(vecs);
    return [
        must(Polygon2.make(vecs.map((e) => must(compressor.compress(e))))),
        vecs,
        compressor,
    ];
});

(async () => {
    await day9.examples();
    await day9.solve();
})();
