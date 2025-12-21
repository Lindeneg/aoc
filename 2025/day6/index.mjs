import day from "../day.mjs";

const day6 = day(
    {
        path: "./input",
        expected: 4449991244405,
    },
    {
        path: "./input",
        expected: 9348430857627,
    },
    {
        path: "./example-input",
        expected1: 4277556,
        expected2: 3263827,
    }
);

const operations = {
    "+": function (a, b) {
        return a + b;
    },
    "*": function (a, b) {
        return a * b;
    },
};

function makeCalculation(operation = null, operands = []) {
    return {operation, operands};
}

function pushOperandString(calculation, operandString) {
    calculation.operands.push(
        ...operandString.split(" ").reduce((acc, cur) => {
            if (!cur) return acc;
            acc.push(Number(cur));
            return acc;
        }, [])
    );
    return calculation;
}

function evaluateCalculation(calculation) {
    let answer = calculation.operands[0];
    for (let i = 1; i < calculation.operands.length; i++) {
        const operand = calculation.operands[i];
        answer = calculation.operation(answer, operand);
    }
    return answer;
}

function evaluateCalculationEx(calculation, operandStr) {
    return evaluateCalculation(pushOperandString(calculation, operandStr));
}

day6.setTransform((arrBuf, split) => {
    const transformed = arrBuf.toString().trimEnd().split(split);
    const part1 = transformed
        .map((e) => e.split(" "))
        .map((e) => e.filter((ee) => !!ee));
    const part2 = transformed.map((e) => e.split(""));
    return [
        part1,
        part1.length,
        part1[0].length,
        part2,
        part2.length,
        part2[0].length,
    ];
});

day6.setPart1(([buf, rows, cols]) => {
    for (let col = 0; col < cols; col++) {
        const calculation = makeCalculation();
        for (let row = 0; row < rows; row++) {
            const value = buf[row][col];
            const op = operations[value];
            if (op) {
                calculation.operation = op;
            } else {
                calculation.operands.push(Number(value));
            }
        }
        day6.answers.part1 += evaluateCalculation(calculation);
    }
});

day6.setPart2(([, , , buf, rows, cols]) => {
    let currentCalculation = makeCalculation();
    let currentNumberStr = "";
    for (let offset = 1; offset < cols + 1; offset++) {
        let emptyRows = 0;
        for (let row = 0; row < rows; row++) {
            let value = buf[row][cols - offset];
            if (!value) continue;
            const op = operations[value];
            value = value.trim();
            if (!value) {
                emptyRows++;
            } else if (op) {
                currentCalculation.operation = op;
            } else {
                currentNumberStr += value;
            }
        }
        if (emptyRows === rows) {
            day6.answers.part2 += evaluateCalculation(currentCalculation);
            currentCalculation = makeCalculation();
        }

        pushOperandString(currentCalculation, currentNumberStr);
        currentNumberStr = "";
    }

    day6.answers.part2 += evaluateCalculationEx(
        currentCalculation,
        currentNumberStr
    );
});

await day6.examples();
await day6.run();
