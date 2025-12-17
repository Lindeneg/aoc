import day from "../day.mjs";

const day2 = day(
    {
        path: "./input",
        expected: 12586854255,
    },
    {
        path: "./input",
        expected: 17298174201,
    },
    {
        path: "./example-input",
        expected1: 1227775554,
        expected2: 4174379265,
    }
);

day2.setSplit(",");

day2.setOnce((buf) => {
    for (let i = 0; i < buf.length; i++) {
        const [start, end] = buf[i].split("-").map((e) => Number(e));
        for (let j = start; j <= end; j++) {
            const t = String(j).split("");
            if (t[0] === "0") continue;
            if (isInvalidIdPart1(t)) day2.answers.part1 += j;
            if (isInvalidIdPart2(t)) day2.answers.part2 += j;
        }
    }
});

function isInvalidIdPart1(t) {
    const half = Math.floor(t.length / 2);
    const [firstPart, lastPart] = [
        t.slice(0, half).reduce((acc, cur) => {
            return (acc += cur);
        }, ""),
        t.slice(half).reduce((acc, cur) => {
            return (acc += cur);
        }, ""),
    ];
    return firstPart === lastPart;
}

function isInvalidIdPart2(t) {
    for (let len = 1; len <= t.length / 2; len++) {
        if (t.length % len !== 0) continue;

        const pattern = t.slice(0, len);
        let valid = true;

        for (let i = len; i < t.length; i += len) {
            if (t.slice(i, i + len).join() !== pattern.join()) {
                valid = false;
                break;
            }
        }

        if (valid) return true;
    }

    return false;
}

await day2.examples();
await day2.run();
