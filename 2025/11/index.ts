import {Day, Vertex, VertexGraph, unwrap, GRAPH_MODE} from "../../cl";

// TODO dynamiaclly build the graph, part 2 gets really slow.

class DeviceVertex extends Vertex<string> {
    constructor(config: string) {
        super(config);
    }
}

type Graph = VertexGraph<typeof DeviceVertex, (v: string) => string>;

const day11 = new Day(
    (
        _,
        graph: Graph,
        start: string,
        end: string,
        mustContain: string[] = []
    ) => {
        return distinctPathCount(graph, start, end, mustContain);
    },
    [674, null],
    [5, {path: "./example2.in", want: 2}]
).setPostTransform((transformed) => {
    const graph: Graph = new VertexGraph(
        DeviceVertex,
        (v) => v,
        GRAPH_MODE.DIRECTED
    );
    for (const line of transformed) {
        let [vertexData, ...edges] = line.split(" ");
        vertexData = vertexData.slice(0, vertexData.length - 1);
        graph.addVertex(vertexData);
        for (const edgeData of edges) {
            graph.addVertex(edgeData);
            unwrap(graph.addEdgeFromData(vertexData, edgeData));
        }
    }

    return graph;
});

function distinctPathCount(
    graph: Graph,
    start: string,
    end: string,
    mustContain: string[]
) {
    let answer = 0;
    const startVertex = graph.getVertex(start)!;
    for (const edge of startVertex.edges) {
        if (graph.hash(end) === graph.hash(edge.next.data)) {
            //            const hasRequired = mustContain.reduce((result, required) => {
            //                return result && path.includes(required);
            //            }, true);
            return 1;
        }
        answer += distinctPathCount(graph, edge.next.data, end, mustContain);
    }
    return answer;
}

(async () => {
    console.log(await day11.examples(1, "you", "out"));
    console.log(await day11.examples(2, "svr", "out", ["dac", "fft"]));
    //    console.log(await day11.solve(1, "you", "out"));
    // console.log(await day11.solve(2, "svr", "out", ["dac", "fft"]));
})();
