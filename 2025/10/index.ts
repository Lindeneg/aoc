import {
    Day,
    GRAPH_MODE,
    Vertex,
    VertexGraph,
    bfs,
    must,
    getSearchResultDistance,
} from "../../cl";

type Configuration = readonly number[];

type Machine = {
    readonly target: Configuration;
    readonly buttons: readonly (readonly number[])[];
};

class MachineVertex extends Vertex<Configuration> {
    constructor(data: Configuration) {
        super(data);
    }

    toString(): string {
        return this.data.join("");
    }
}

function solvePart2(machine: Machine): number {
    const {target, buttons} = machine;
    const memo = new Map<string, number>();

    function solve(joltages: number[]): number {
        if (joltages.every((j) => j === 0)) {
            return 0;
        }

        // negative joltages should be impossible
        // maybe an assert is better here
        if (joltages.some((j) => j < 0)) {
            return Infinity;
        }

        const key = joltages.join(",");
        if (memo.has(key)) {
            return memo.get(key)!;
        }

        const parityPattern = joltages.map((j) => j % 2);
        const validPatterns = findValidPatterns(buttons, parityPattern);

        let minCost = Infinity;
        for (const pattern of validPatterns) {
            const contribution = Array(joltages.length).fill(0);
            for (const buttonIdx of pattern) {
                for (const counterIdx of buttons[buttonIdx]) {
                    contribution[counterIdx]++;
                }
            }

            const remainingJoltage = joltages.map(
                (j, i) => j - contribution[i]
            );

            if (remainingJoltage.every((r) => r % 2 === 0)) {
                const halved = remainingJoltage.map((r) => r / 2);
                const subCost = solve(halved);
                const totalCost = 2 * subCost + pattern.length;
                minCost = Math.min(minCost, totalCost);
            }
        }

        memo.set(key, minCost);
        return minCost;
    }

    return solve([...target]);
}

function findValidPatterns(
    buttons: readonly (readonly number[])[],
    targetParity: number[]
): number[][] {
    const validPatterns: number[][] = [];
    const numButtons = buttons.length;

    // this does try all 2^numButtons combinations which isnt great
    for (let mask = 0; mask < 1 << numButtons; mask++) {
        const pattern: number[] = [];
        const parity = Array(targetParity.length).fill(0);

        for (let i = 0; i < numButtons; i++) {
            if (mask & (1 << i)) {
                pattern.push(i);
                for (const counterIdx of buttons[i]) {
                    parity[counterIdx] ^= 1;
                }
            }
        }

        if (parity.every((p, i) => p === targetParity[i])) {
            validPatterns.push(pattern);
        }
    }

    return validPatterns;
}

const day10 = new Day(
    (part, machines: Machine[]) => {
        let answer = 0;

        for (const machine of machines) {
            if (part.one) {
                const graph = new VertexGraph(
                    MachineVertex,
                    (cfg) => cfg.join(","),
                    GRAPH_MODE.DIRECTED
                );

                const start = Array(machine.target.length).fill(0);
                const startHash = graph.hash(start);
                const endHash = graph.hash(machine.target);

                must(graph.addVertex(start));

                const result = must(
                    bfs(graph, startHash, endHash, (vertex) => {
                        // expand function
                        return machine.buttons.map((button) => {
                            const next = vertex.data.slice();
                            for (const idx of button) {
                                next[idx] = next[idx] === 0 ? 1 : 0;
                            }
                            return next;
                        });
                    })
                );

                answer += getSearchResultDistance(result);
            } else {
                const cost = solvePart2(machine);
                if (cost < Infinity) {
                    answer += cost;
                }
            }
        }

        return answer;
    },
    [441, 18559],
    [7, 33]
).setPostTransform((transformed, part) => {
    return transformed.map((line) => {
        const diagramMatch = line.match(/\[([.#]+)\]/)!;
        const buttonsMatch = [...line.matchAll(/\(([\d,]+)\)/g)];
        const joltageMatch = [...line.matchAll(/\{([\d,]+)\}/g)];

        const target: Configuration = [...diagramMatch[1]].map((c) =>
            Number(c === "#")
        );

        const buttons = buttonsMatch.map((m) => m[1].split(",").map(Number));
        const joltage: Configuration = joltageMatch
            .map((m) => m[1].split(",").map(Number))
            .flat();

        return {target: part.one ? target : joltage, buttons};
    });
});

(async () => {
    await day10.examples();
    await day10.solve();
})();
