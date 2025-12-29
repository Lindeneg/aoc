import day from "../day.mjs";
import Vec3 from "../vec3.mjs";
import makeUfFromMode, {UF_MODE} from "../uf.mjs";

const day8 = day(solve, [68112, 44543856], [40, 25272]);

day8.setPostTransform((transformed) => {
    return transformed.map((line) => {
        const [x, y, z] = line.split(",");
        return new Vec3(+x, +y, +z);
    });
});

function solve(vecs, part, maxConnections, mode = UF_MODE.BIT) {
    const [pairs, ufData] = makeUfData(mode, vecs);
    const uf = makeUfFromMode(mode, ufData, vecs);

    let connections = 0;
    for (const [a, b] of pairs) {
        if (part.one && connections >= maxConnections) break;
        if (uf.merge(a, b) >= vecs.length && part.two) {
            return vecs[a].x * vecs[b].x;
        } else {
            connections++;
        }
    }

    if (part.one) {
        return uf
            .sizes()
            .slice(0, 3)
            .reduce((a, b) => a * b, 1);
    }

    return 0;
}

function makeUfData(mode, vecs) {
    const isBitMode = mode === UF_MODE.BIT;

    const pairs = [];
    const boxes = isBitMode ? null : new Set();

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
        return [pairs, vecs.length];
    }

    return [pairs, boxes];
}

await day8.examples(1, false, 10);
await day8.examples(2);

await day8.run(1, false, 1000);
await day8.run(2, false);
