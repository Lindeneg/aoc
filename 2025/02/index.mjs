import day from "../day.mjs";

// TODO: really slow mate, how about using your brain maybe?

const day2 = day(solve, [12586854255, 17298174201], [1227775554, 4174379265]);

day2.setSplit(",");

function solve(buf, part) {
    let answer = 0;
    for (let i = 0; i < buf.length; i++) {
        const [start, end] = buf[i].split("-").map((e) => Number(e));
        for (let j = start; j <= end; j++) {
            const t = String(j).split("");
            if (t[0] === "0") continue;
            if (part.one && hasReapeatingTwice(t)) answer += j;
            if (part.two && hasReapeatingGteTwice(t)) answer += j;
        }
    }
    return answer;
}

function hasReapeatingTwice(t) {
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

function hasReapeatingGteTwice(t) {
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
