import {Day} from "../../cl";

// TODO PART 2!!!! USE YOUR FUCKING BRAIN YOU DONKEY

const day3 = new Day(
    (part, buf: string[]) => {
        let answer = 0;
        for (const line of buf) {
            if (part.one) answer += makeLargestDigit(line, 2);
            //if (part.to) answer += makeLargestDigit(line, 12);
        }
        return answer;
    },
    [17263, null],
    [357, 3121910778619]
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

function makeLargestDigit(s: string, numOfDigits: number) {
    let size = s.length - numOfDigits + 1;
    let result = "";
    let start = 0;
    for (let _ = 0; _ < numOfDigits; _++) {
        const largest = findLargestDigit(s, start, start + size);
        result += largest.value.toString();
        start = largest.index + 1;
    }
    return Number(result);
}

(async () => {
    console.log(await day3.examples());
    console.log(await day3.solve());
})();
