import {Day} from "../../cl";

const DIAL_LIMIT = 99;
const LEFT = "L";

const day1 = new Day(
    (part, buf: string[], dial: number) => {
        let answer = 0;
        const dialSize = DIAL_LIMIT + 1;

        for (let i = 0; i < buf.length; i++) {
            const row = buf[i];
            const isLeft = row[0] === LEFT;
            const number = parseInt(row.slice(1));

            if (isLeft) {
                const newDial = dial - number;
                if (newDial < 0 && part.two) {
                    const wraps = Math.ceil(-newDial / dialSize);
                    answer += wraps;
                }
                dial = ((newDial % dialSize) + dialSize) % dialSize;
            } else {
                const newDial = dial + number;
                if (newDial > DIAL_LIMIT && part.two) {
                    const wraps = Math.floor(newDial / dialSize);
                    answer += wraps;
                }
                dial = newDial % dialSize;
            }

            if (part.one && dial === 0) answer++;
        }
        return answer;
    },
    [999, 6099],
    [3, 6]
);

(async () => {
    console.log(await day1.examples(0, 50));
    console.log(await day1.solve(0, 50));
})();
