import {Day, Vertex, VertexGraph, bfs, getSearchResultDistance} from "../../cl";

type Configuration = readonly boolean[];

type Machine = {
    readonly target: Configuration;
    readonly buttons: readonly (readonly number[])[];
};

class MachineVertex extends Vertex<Configuration> {
    constructor(data: Configuration) {
        super(data);
    }
}

const day10 = new Day(
    (_, machines: Machine[]) => {
        let answer = 0;
        for (const machine of machines) {
            const graph = new VertexGraph(MachineVertex, (cfg) =>
                cfg.reduce((acc, cur, idx) => {
                    if (cur) acc |= 1 << idx;
                    return acc;
                }, 0)
            );

            const start = Array(machine.target.length).fill(false);
            const startHash = graph.hash(start);
            const endHash = graph.hash(machine.target);

            graph.addVertex(start);

            const result = bfs(graph, startHash, endHash, (vertex) => {
                const cfg = vertex.data;

                return machine.buttons.map((button) => {
                    const next = cfg.slice(); // clone
                    for (const idx of button) {
                        next[idx] = !next[idx];
                    }
                    return next;
                });
            });

            answer += getSearchResultDistance(result);
        }
        return answer;
    },
    [441, null],
    [7, null]
).setPostTransform((transformed) => {
    return transformed.map((line) => {
        const diagramMatch = line.match(/\[([.#]+)\]/)!;
        const buttonsMatch = [...line.matchAll(/\(([\d,]+)\)/g)];

        const target: Configuration = [...diagramMatch[1]].map(
            (c) => c === "#"
        );

        const buttons = buttonsMatch.map((m) => m[1].split(",").map(Number));

        return {target, buttons};
    });
});

(async () => {
    await day10.examples();
    await day10.solve();
})();
