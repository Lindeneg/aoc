import day from "../day.mjs";
import Grid2 from "../grid2.mjs";

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

day6.setTransform((arrBuf, split) => {
    const transformed = arrBuf.toString().trimEnd().split(split);
    return [
        new Grid2(
            transformed
                .map((e) => e.split(" "))
                .map((e) => e.filter((ee) => !!ee))
        ),
        new Grid2(transformed.map((e) => e.split(""))),
    ];
});

day6.setPart1(([grid]) => {
    for (let col = 0; col < grid.cols; col++) {
        const calculation = makeCalculation();
        for (let row = 0; row < grid.rows; row++) {
            const value = grid.getEx(col, row);
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

day6.setPart2(([, grid]) => {
    let currentCalculation = makeCalculation();
    let currentNumberStr = "";
    for (let offset = 1; offset < grid.cols + 1; offset++) {
        let emptyRows = 0;
        for (let row = 0; row < grid.rows; row++) {
            let value = grid.getEx(grid.cols - offset, row);
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
        if (emptyRows === grid.rows) {
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

await day6.examples();
await day6.run();
