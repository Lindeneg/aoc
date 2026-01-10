import {Day, Grid2, must} from "../../cl";

type Grid = Grid2<string>;

type Calculation = {
    operation: ((a: number, b: number) => number) | null;
    operands: number[];
};

const OPERATIONS = {
    "+": function (a: number, b: number) {
        return a + b;
    },
    "*": function (a: number, b: number) {
        return a * b;
    },
} as const;

const day6 = new Day(
    (part, grids: [Grid, Grid]) => {
        if (part.one) return part1(grids[0]);
        if (part.two) return part2(grids[1]);
        return 0;
    },
    [4449991244405, 9348430857627],
    [4277556, 3263827]
).setPostTransform((transformed) => {
    return [
        must(
            Grid2.fromNested(
                transformed
                    .map((e) => e.split(" "))
                    .map((e) => e.filter((ee) => !!ee))
            )
        ),
        must(
            Grid2.fromNestedWithPadding(
                transformed.map((e) => e.split("")),
                " "
            )
        ),
    ];
});

function makeCalculation(operation = null, operands = []): Calculation {
    return {operation, operands};
}

function pushOperandString(calculation: Calculation, operandString: string) {
    calculation.operands.push(
        ...operandString.split(" ").reduce((acc, cur) => {
            if (!cur) return acc;
            acc.push(Number(cur));
            return acc;
        }, [] as number[])
    );
    return calculation;
}

function evaluateCalculation(calculation: Calculation) {
    if (!calculation.operation) return 0;
    let answer = calculation.operands[0];
    for (let i = 1; i < calculation.operands.length; i++) {
        const operand = calculation.operands[i];
        answer = calculation.operation(answer, operand);
    }
    return answer;
}

function part1(grid: Grid) {
    let answer = 0;
    for (let col = 0; col < grid.width; col++) {
        const calculation = makeCalculation();
        for (let row = 0; row < grid.height; row++) {
            const value = must(grid.getFromCoords(col, row));
            if (value in OPERATIONS) {
                calculation.operation =
                    OPERATIONS[value as keyof typeof OPERATIONS];
            } else {
                calculation.operands.push(Number(value));
            }
        }
        answer += evaluateCalculation(calculation);
    }
    return answer;
}

function part2(grid: Grid) {
    let answer = 0;
    let currentCalculation = makeCalculation();
    let currentNumberStr = "";
    for (let offset = 1; offset < grid.width + 1; offset++) {
        let emptyRows = 0;
        for (let row = 0; row < grid.height; row++) {
            let value = must(grid.getFromCoords(grid.width - offset, row));
            if (!value) continue;
            value = value.trim();
            if (!value) {
                emptyRows++;
            } else if (value in OPERATIONS) {
                currentCalculation.operation =
                    OPERATIONS[value as keyof typeof OPERATIONS];
            } else {
                currentNumberStr += value;
            }
        }
        if (emptyRows === grid.height) {
            answer += evaluateCalculation(currentCalculation);
            currentCalculation = makeCalculation();
        }

        pushOperandString(currentCalculation, currentNumberStr);
        currentNumberStr = "";
    }

    answer += evaluateCalculation(
        pushOperandString(currentCalculation, currentNumberStr)
    );

    return answer;
}

(async () => {
    await day6.examples();
    await day6.solve();
})();
