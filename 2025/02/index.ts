import {Day} from "../../cl";

const day2 = new Day(
    (part, buf: string[]) => {
        let answer = 0;
        for (let i = 0; i < buf.length; i++) {
            const [start, end] = buf[i].split("-").map((e) => Number(e));
            for (let j = start; j <= end; j++) {
                const str = String(j);
                if (str[0] === "0") continue;
                if (part.one && hasRepeatingTwice(str)) answer += j;
                if (part.two && hasRepeatingGteTwice(str)) answer += j;
            }
        }
        return answer;
    },
    [12586854255, 17298174201],
    [1227775554, 4174379265]
).setSplit(",");

function hasRepeatingTwice(str: string): boolean {
    if (str.length % 2 !== 0) return false;
    const mid = str.length / 2;
    return str.slice(0, mid) === str.slice(mid);
}

function hasRepeatingGteTwice(str: string): boolean {
    const len = str.length;
    for (let patternLen = 1; patternLen <= len / 2; patternLen++) {
        if (len % patternLen !== 0) continue;

        const pattern = str.slice(0, patternLen);
        let valid = true;
        for (let i = patternLen; i < len; i += patternLen) {
            if (str.slice(i, i + patternLen) !== pattern) {
                valid = false;
                break;
            }
        }
        if (valid) return true;
    }
    return false;
}

(async () => {
    console.log(await day2.examples());
    console.log(await day2.solve());
})();
