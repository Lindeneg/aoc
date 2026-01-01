import Day, {Result} from "../day";
import Vec3 from "../vec3";
import {UfObjectKeyed, UfBitPacked, UF_MODE, type UfMode, type Uf} from "../uf";

type Pair = [a: number | Vec3, b: number | Vec3, distance: number];
type Data = [uf: Uf<any>, vecs: Vec3[], pairs: Pair[]];

const day8 = new Day(
    (part, [uf, vecs, pairs]: Data, maxConnections: number, mode: UfMode) => {
        let answer = 0;

        let connections = 0;
        for (const [a, b] of pairs) {
            if (part.one && connections >= maxConnections) break;
            if (uf.merge(a, b) >= vecs.length && part.two) {
                if (mode === UF_MODE.BIT) {
                    answer = vecs[<number>a].x * vecs[<number>b].x;
                } else {
                    answer = (<Vec3>a).x * (<Vec3>b).x;
                }
                break;
            } else {
                connections++;
            }
        }

        //if (part.isExample) console.log(uf);

        if (part.one) {
            answer = uf
                .sizes()
                .slice(0, 3)
                .reduce((a, b) => a * b, 1);
        }

        return new Result(answer, mode);
    },
    [68112, 44543856],
    [40, 25272]
).setPostTransform((transformed, _, mode) => {
    const vecs = transformed.map((line) => {
        const [x, y, z] = line.split(",");
        return new Vec3(+x, +y, +z);
    });

    const isBitMode = mode === UF_MODE.BIT;

    const pairs: Pair[] = [];
    const boxes = new Set<Vec3>();

    // TODO: optimize this
    for (let i = 0; i < vecs.length; i++) {
        for (let j = i + 1; j < vecs.length; j++) {
            const a = vecs[i];
            const b = vecs[j];
            const distance = a.distance(b);
            if (isBitMode) {
                pairs.push([i, j, distance]);
            } else {
                boxes.add(a);
                boxes.add(b);
                pairs.push([a, b, distance]);
            }
        }
    }

    pairs.sort((a, b) => a[2] - b[2]);

    if (isBitMode) {
        return [
            new UfBitPacked(vecs.length, (i) => vecs[i]),
            vecs,
            pairs,
        ] as Data;
    }

    return [new UfObjectKeyed(boxes), vecs, pairs] as Data;
});

(async () => {
    await day8.examples(0, 10, UF_MODE.BIT);
    await day8.solve(0, 1000, UF_MODE.BIT);
})();
