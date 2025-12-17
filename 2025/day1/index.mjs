import day from "../day.mjs";

const day1 = day(
    {
        path: "./input",
        expected: 999,
    },
    {
        path: "./input",
        expected: 6099,
    },
    {
        path: "./example-input",
        expected1: 3,
        expected2: 6,
    }
);

function makeDial(buf, dial = 50, limit = 100) {
    for (let i = 0; i < buf.length; i++) {
        const row = buf[i];
        const isLeft = row[0] === "L";
        const number = parseInt(row.slice(1));

        for (let j = 0; j < number; j++) {
            if (isLeft) {
                dial--;
                if (dial < 0) {
                    day1.answers.part2++;
                    dial = limit - 1;
                }
            } else {
                dial++;
                if (dial >= limit) {
                    day1.answers.part2++;
                    dial = 0;
                }
            }
        }

        if (dial === 0) day1.answers.part1++;
    }
}

day1.setOnce(makeDial);

await day1.examples();
await day1.run();
