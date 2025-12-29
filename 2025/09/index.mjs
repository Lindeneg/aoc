import day from "../day.mjs";
import Vec2 from "../vec2.mjs";

const day9 = day(solve, [4776100539, null], [50, 24]);

day9.setPostTransform((transformed) => {
    return transformed.map((e) => {
        const [x, y] = e.split(",");
        return new Vec2(+x, +y);
    });
});

function solve(buf, part) {
    let answer = 0;
    for (let i = 0; i < buf.length; i++) {
        for (let j = i + 1; j < buf.length; j++) {
            const a = buf[i];
            const b = buf[j];
            if (a.x > b.x && a.y >= b.y) {
                const area = areaFromOppositeCorners(a, b);
                if (area > answer) answer = area;
            }
        }
    }
    return answer;
}

function areaFromOppositeCorners(a, b) {
    const [x1, y1] = [Math.abs(a.x), Math.abs(a.y)];
    const [x2, y2] = [Math.abs(b.x), Math.abs(b.y)];
    return (x1 - x2 + 1) * (y1 - y2 + 1);
}

await day9.examples(1);
await day9.run(1);
