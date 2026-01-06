import {Day, VertexGraph, Vertex, bfs} from "../../cl";

type MachineConfig = Uint8Array;

type Machine = {
    desiredConfig: MachineConfig;
    lights: Uint8Array;
    buttons: number[];
    joltage: number[];
};

class MachineVertexCustomProps extends Vertex<MachineConfig, {weight: number}> {
    constructor(data: MachineConfig) {
        super(data);
    }
}

const graph1 = new VertexGraph(MachineVertexCustomProps, (d) => 2 as number);

graph1.getVertexByHash(0)!.edges[0].next.edges[0].next;

bfs(graph1, 1, graph1.getVertex({} as MachineConfig)!);

const day10 = new Day(
    (part, machines: Machine[]) => {
        let answer = 0;
        for (const machine of machines) {
        }
        return answer;
    },
    [null, null],
    [7, null]
).setPostTransform((transformed) => {
    const machines: Machine[] = [];
    return machines;
});

(async () => {
    await day10.examples(1);
    //await day10.solve();
})();
