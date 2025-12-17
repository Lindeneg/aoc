import day from "../day.mjs";

// TODO PART 2!!!! USE YOUR FUCKING BRAIN YOU DONKEY

const day3 = day(
    {
        path: "./input",
        expected: 17263,
    },
    {
        path: "./input",
        expected: null,
    },
    {
        path: "./example-input",
        expected1: 357,
        expected2: 3121910778619,
    }
);

// given a string of numbers, find N amount of consecutive digits
// that will create the larget number

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
    console.log({s, result, numOfDigits, size});
    return Number(result);
}

day3.setOnce((buf) => {
    for (const line of buf) {
        //        day3.answers.part1 += makeLargestDigit(line, 2);
        day3.answers.part2 += makeLargestDigit(line, 12);
    }
});

await day3.examples(2);
//await day3.run();
