import Day from "../day";

const DIAL_LIMIT = 99;
const LEFT = "L";

const day1 = new Day(
    (part, buf: string[], dial: number) => {
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
    },
    [999, 6099],
    [3, 6]
);

(async () => {
    await day1.examples(0, 50);
    await day1.solve(0, 50);
})();
