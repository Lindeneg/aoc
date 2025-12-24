import day from "../day.mjs";

const DIAL_LIMIT = 99;

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

day1.setOnce((buf) => {
    let dial = 50;
    for (let i = 0; i < buf.length; i++) {
        const row = buf[i];
        const isLeft = row[0] === "L";
        const number = parseInt(row.slice(1));

        for (let j = 0; j < number; j++) {
            if (isLeft) {
                dial--;
                if (dial < 0) {
                    day1.answers.part2++;
                    dial = DIAL_LIMIT;
                }
            } else {
                dial++;
                if (dial > DIAL_LIMIT) {
                    day1.answers.part2++;
                    dial = 0;
                }
            }
        }

        if (dial === 0) day1.answers.part1++;
    }
});

await day1.examples();
await day1.run();
