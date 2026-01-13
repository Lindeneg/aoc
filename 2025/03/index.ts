import {Day} from "../../cl";

const day3 = new Day(
    (part, buf: string[]) => {
        let answer = 0n;
        for (const line of buf) {
            if (part.one) answer += makeLargestDigit(line, 2);
            if (part.two) answer += makeLargestDigit(line, 12);
        }
        return answer;
    },
    [17263n, 170731717900423n],
    [357n, 3121910778619n]
);

function findLargestDigit(s: string, start: number, end: number) {
    const match = {value: 0, index: -1};
    for (let i = start; i < end; i++) {
        const value = Number(s[i]);
        if (value > match.value) {
            match.value = value;
            match.index = i;
        }
    }
    return match;
}

function makeLargestDigit(s: string, numOfDigits: number): bigint {
    let result = "";
    let start = 0;
    let remaining = numOfDigits;

    for (let _ = 0; _ < numOfDigits; _++) {
        const end = s.length - remaining + 1;
        const largest = findLargestDigit(s, start, end);
        result += largest.value.toString();
        start = largest.index + 1;
        remaining--;
    }
    return BigInt(result);
}

(async () => {
    console.log(await day3.examples());
    console.log(await day3.solve());
})();
