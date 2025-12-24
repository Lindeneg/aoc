import day from "../day.mjs";

const day1 = day(
    solve,
    [
        {
            path: "puzzle.in",
            want: 999,
        },
        {
            path: "puzzle.in",
            want: 6099,
        },
    ],
    [
        {
            path: "example.in",
            want: 3,
        },
        {
            path: "example.in",
            want: 6,
        },
    ]
);

const DIAL_LIMIT = 99;
const LEFT = "L";

function solve(buf, part, dial = 50) {
    let answer = 0;
    for (let i = 0; i < buf.length; i++) {
        const row = buf[i];
        const isLeft = row[0] === LEFT;
        const number = parseInt(row.slice(1));

        for (let j = 0; j < number; j++) {
            if (isLeft) {
                dial--;
                if (dial < 0) {
                    if (part.two) answer++;
                    dial = DIAL_LIMIT;
                }
            } else {
                dial++;
                if (dial > DIAL_LIMIT) {
                    if (part.two) answer++;
                    dial = 0;
                }
            }
        }

        if (part.one && dial === 0) answer++;
    }
    return answer;
}

await day1.examples();
await day1.run();
