import day from "../day.mjs";

// TODO PART 2!!!! USE YOUR FUCKING BRAIN YOU DONKEY

const day3 = day(solve, [17263, null], [357, null /*3121910778619*/]);

function solve(buf, part) {
    let answer = 0;
    for (const line of buf) {
        if (part.one) answer += makeLargestDigit(line, 2);
        //if (part.to) answer += makeLargestDigit(line, 12);
    }
    return answer;
}

function findLargestDigit(s, start, end) {
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

function makeLargestDigit(s, numOfDigits) {
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

await day3.examples();
await day3.run();
