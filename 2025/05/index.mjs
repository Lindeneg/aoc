import day from "../day.mjs";

const day5 = day(solve, [770, 357674099117260], [3, 14]);

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

function solve(buf, part) {
    if (part.one) return freshIdCount(buf);
    if (part.two) return freshIdsFromRangeCount(buf);
    return 0;
}

function freshIdCount({ranges, ids, minFreshId, maxFreshId}) {
    let answer = 0;
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        if (id > maxFreshId || id < minFreshId) continue;
        for (let j = 0; j < ranges.length; j++) {
            const range = ranges[j];
            if (id >= range.from && id <= range.to) {
                answer++;
                break;
            }
        }
    }
    return answer;
}

function freshIdsFromRangeCount(buf) {
    const ranges = [...buf.ranges].sort((a, b) => a.from - b.from);

    let answer = 0;
    let currentFrom = ranges[0].from;
    let currentTo = ranges[0].to;
    for (let i = 1; i < ranges.length; i++) {
        const range = ranges[i];

        if (range.from <= currentTo + 1) {
            currentTo = Math.max(currentTo, range.to);
        } else {
            answer += currentTo - currentFrom + 1;
            currentFrom = range.from;
            currentTo = range.to;
        }
    }
    answer += currentTo - currentFrom + 1;
    return answer;
}

await day5.examples();
await day5.run();
