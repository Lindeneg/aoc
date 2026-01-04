import {Day} from "../../cl";

// TODO: really slow mate, how about using your brain maybe?

const day2 = new Day(
    (part, buf: string[]) => {
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
    },
    [12586854255, 17298174201],
    [1227775554, 4174379265]
).setSplit(",");

function hasReapeatingTwice(t: string[]) {
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

function hasReapeatingGteTwice(t: string[]) {
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

(async () => {
    await day2.examples();
    await day2.solve();
})();
