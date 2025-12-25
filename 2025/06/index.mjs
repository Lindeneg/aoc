import day from "../day.mjs";
import Grid2 from "../grid2.mjs";

const OPERATIONS = {
    "+": function (a, b) {
        return a + b;
    },
    "*": function (a, b) {
        return a * b;
    },
};

const day6 = day(solve, [4449991244405, 9348430857627], [4277556, 3263827]);

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

function solve(grids, part) {
    if (part.one) return part1(grids[0]);
    if (part.two) return part2(grids[1]);
    return 0;
}

function part1(grid) {
    let answer = 0;
    for (let col = 0; col < grid.cols; col++) {
        const calculation = makeCalculation();
        for (let row = 0; row < grid.rows; row++) {
            const value = grid.getEx(col, row);
            const op = OPERATIONS[value];
            if (op) {
                calculation.operation = op;
            } else {
                calculation.operands.push(Number(value));
            }
        }
        answer += evaluateCalculation(calculation);
    }
    return answer;
}

function part2(grid) {
    let answer = 0;
    let currentCalculation = makeCalculation();
    let currentNumberStr = "";
    for (let offset = 1; offset < grid.cols + 1; offset++) {
        let emptyRows = 0;
        for (let row = 0; row < grid.rows; row++) {
            let value = grid.getEx(grid.cols - offset, row);
            if (!value) continue;
            const op = OPERATIONS[value];
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
            answer += evaluateCalculation(currentCalculation);
            currentCalculation = makeCalculation();
        }

        pushOperandString(currentCalculation, currentNumberStr);
        currentNumberStr = "";
    }

    answer += evaluateCalculationEx(currentCalculation, currentNumberStr);

    return answer;
}

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
