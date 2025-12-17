import day from "../day.mjs";

const day5 = day(
    {
        path: "./input",
        expected: 770,
    },
    {
        path: "./input",
        expected: 357674099117260,
    },
    {
        path: "./example-input",
        expected1: 3,
        expected2: 14,
    }
);

day5.setTransform((arrBuf, split) => {
    return arrBuf
        .toString()
        .trimEnd()
        .split(split)
        .reduce(
            (acc, cur) => {
                if (!cur) return acc;
                if (cur.includes("-")) {
                    const [from, to] = cur.split("-").map((e) => Number(e));
                    acc.ranges.push({
                        from,
                        to,
                    });
                    if (from < acc.minFreshId) acc.minFreshId = from;
                    if (to > acc.maxFreshId) acc.maxFreshId = to;
                } else {
                    const number = parseInt(cur);
                    if (Number.isNaN(number)) return acc;
                    acc.ids.push(number);
                }
                return acc;
            },
            {ranges: [], ids: [], minFreshId: Infinity, maxFreshId: 0}
        );
});

day5.setPart1(({ranges, ids, minFreshId, maxFreshId}) => {
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        if (id > maxFreshId || id < minFreshId) continue;
        for (let j = 0; j < ranges.length; j++) {
            const range = ranges[j];
            if (id >= range.from && id <= range.to) {
                day5.answers.part1++;
                break;
            }
        }
    }
});

day5.setPart2((buf) => {
    const ranges = [...buf.ranges].sort((a, b) => a.from - b.from);

    let currentFrom = ranges[0].from;
    let currentTo = ranges[0].to;
    for (let i = 1; i < ranges.length; i++) {
        const range = ranges[i];

        if (range.from <= currentTo + 1) {
            currentTo = Math.max(currentTo, range.to);
        } else {
            day5.answers.part2 += currentTo - currentFrom + 1;
            currentFrom = range.from;
            currentTo = range.to;
        }
    }

    day5.answers.part2 += currentTo - currentFrom + 1;
});

await day5.examples();
await day5.run();
