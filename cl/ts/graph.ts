import {hasKey} from "./common";
import Printable from "./printable";
import {success, failure} from "./result";
import type {Nullable, Result, Class, AnyObj, Stringable} from "./types";

export const GRAPH_MODE = {
    DIRECTED: 0,
    UNDIRECTED: 1,
} as const;

export type GraphMode = (typeof GRAPH_MODE)[keyof typeof GRAPH_MODE];

// Default AddEdge parameters from vertices
export type AddEdgeFromVerticiesDefaultParams<
    TNode extends Class<Nodeable<any, any>>,
> = [v0: InstanceType<TNode>, v1: InstanceType<TNode>];

// Default AddEdge parameters from data
export type AddEdgeFromDataDefaultParams<
    TNode extends Class<Nodeable<any, any>>,
> = [d0: InstanceType<TNode>["data"], d1: InstanceType<TNode>["data"]];

// Removes the next property from edges to such that
// we can check if any custom edge properties has been added
export type ExcludeEdgeNext<TNode extends Class<Nodeable<any, any>>> = Omit<
    InstanceType<TNode>["edges"][number],
    "next"
>;

// If custom props are provided to an edge, we extract that
// so we can use it for function parameters. If none are provided
// we only use the default required parameters.
export type AddEdgeParams<
    TNode extends Class<Nodeable<any, any>>,
    TDefaultParams extends any[],
> = keyof ExcludeEdgeNext<TNode> extends never
    ? TDefaultParams
    : [...TDefaultParams, props: ExcludeEdgeNext<TNode>];

export type HashFn<TNode extends Class<Nodeable<any, any>>, TReturn> = (
    data: InstanceType<TNode>["data"]
) => TReturn;

export interface NodeableData extends Stringable {}

// Represents any node with edges
export interface Nodeable<
    TData extends NodeableData,
    TProps extends AnyObj = never,
> extends Stringable {
    readonly data: TData;
    readonly edges: Array<
        [TProps] extends [never]
            ? {next: Nodeable<TData, TProps>}
            : {next: Nodeable<TData, TProps>} & TProps
    >;
}

// Represents any graph that works with Nodeables
export interface Graphable<
    TNode extends Class<Nodeable<any, any>> = any,
    THasher extends HashFn<TNode, any> = any,
> extends Printable {
    get hashes(): MapIterator<ReturnType<THasher>>;

    get hash(): THasher;

    getVertex(p: InstanceType<TNode>["data"]): Nullable<InstanceType<TNode>>;
    getVertexByHash(hash: ReturnType<THasher>): Nullable<InstanceType<TNode>>;
    addVertex(
        ...args: ConstructorParameters<TNode>
    ): Result<InstanceType<TNode>>;
    addVertexOverride(
        ...args: ConstructorParameters<TNode>
    ): [
        newVertex: InstanceType<TNode>,
        oldVertex: Nullable<InstanceType<TNode>>,
    ];

    addEdgeFromVerticies(
        ...[v0, v1, props]: AddEdgeParams<
            TNode,
            AddEdgeFromVerticiesDefaultParams<TNode>
        >
    ): void;

    addEdgeFromData(
        ...[p0, p1, props]: AddEdgeParams<
            TNode,
            AddEdgeFromDataDefaultParams<TNode>
        >
    ): boolean;
}

// Abstract Vertex implementation based on Nodeable.
// Must be extended.
export abstract class Vertex<
        TData extends NodeableData,
        TProps extends AnyObj = never,
    >
    extends Printable
    implements Nodeable<TData, TProps>
{
    readonly data: TData;
    readonly edges: Array<
        [TProps] extends [never]
            ? {next: Vertex<TData, TProps>}
            : {next: Vertex<TData, TProps>} & TProps
    >;

    constructor(data: TData) {
        super();
        this.data = data;
        this.edges = [];
    }

    toString(): string {
        return `Vertex: ${this.data.toString()}, edges: ${this.edges.map((e) =>
            e.next.data.toString()
        )}`;
    }
}

// NOTE: parents.get(startHash) === null if startHash exists.
export type GraphSearchResult<THash> = {
    startHash: THash;
    endHash: THash;
    found: boolean;
    parents: Map<THash, Nullable<THash>>;
};

type VertexFromGraph<TGraph extends Graphable> = NonNullable<
    ReturnType<TGraph["getVertex"]>
>;

type VertexDataFromGraph<TGraph extends Graphable> =
    VertexFromGraph<TGraph>["data"];

export type ExpandReturn<TNode extends Class<Nodeable<any, any>>> =
    keyof ExcludeEdgeNext<TNode> extends never
        ? InstanceType<TNode>["data"]
        : {data: InstanceType<TNode>["data"]} & ExcludeEdgeNext<TNode>;

export type ExpandFn<TGraph extends Graphable> = (
    vertex: VertexFromGraph<TGraph>
) => Iterable<ExpandReturn<Class<VertexFromGraph<TGraph>>>>;

/**
 * Performs breadth-first search on a graph.
 *
 * @param graph - The graph to search
 * @param startHash - Hash of the starting vertex
 * @param endHash - Hash of the target vertex
 * @param expand - Optional function to dynamically generate neighbors during traversal
 *
 * IMPORTANT: When an expand function is provided, this function MUTATES the graph
 * by adding new vertices and edges as they are discovered during traversal.
 * This enables implicit graph construction (useful for state-space search where
 * the full graph is too large to build upfront). If you need the original graph
 * unchanged, either:
 * 1. Don't use the expand function (pre-build the graph), or
 * 2. Copy the graph before calling bfs
 *
 * @returns GraphSearchResult with parent tracking for path reconstruction
 */
export function bfs<TGraph extends Graphable>(
    graph: TGraph,
    startHash: ReturnType<TGraph["hash"]>,
    endHash: ReturnType<TGraph["hash"]>,
    expand?: ExpandFn<TGraph>
): Result<GraphSearchResult<ReturnType<TGraph["hash"]>>> {
    const parents = new Map<
        ReturnType<TGraph["hash"]>,
        Nullable<ReturnType<TGraph["hash"]>>
    >();

    if (startHash === endHash) {
        parents.set(startHash, null);
        return success({
            startHash,
            endHash,
            found: true,
            parents,
        });
    }

    const visited = new Set<ReturnType<TGraph["hash"]>>();
    const queue: Array<ReturnType<TGraph["hash"]>> = [];
    let queueIdx = 0;

    const startVertex = graph.getVertexByHash(startHash);
    if (!startVertex) {
        return success({
            startHash,
            endHash,
            found: false,
            parents,
        });
    }

    visited.add(startHash);
    parents.set(startHash, null);
    queue.push(startHash);

    let found = false;
    while (queueIdx < queue.length) {
        const currentHash = queue[queueIdx++];
        if (currentHash === endHash) {
            found = true;
            break;
        }
        const currentVertex = graph.getVertexByHash(currentHash)!;

        if (typeof expand === "function") {
            for (const result of expand(currentVertex)) {
                let data: VertexDataFromGraph<TGraph>;
                let props: AnyObj = {};

                if (hasKey(result, "data")) {
                    ({data, ...props} = result);
                } else {
                    data = result;
                }
                const nextHash = graph.hash(data);

                let nextVertex = graph.getVertexByHash(nextHash);
                if (!nextVertex) {
                    const addedVertexResult = graph.addVertex(data);
                    if (!addedVertexResult.ok) {
                        return failure(
                            `BFS: failed to add vertex ${nextHash} to graph`
                        );
                    }
                    nextVertex = addedVertexResult.data;
                }

                graph.addEdgeFromVerticies(currentVertex, nextVertex, props);
            }
        }

        for (const edge of currentVertex.edges) {
            const neighbor = edge.next;
            const neighborHash = graph.hash(neighbor.data);
            if (visited.has(neighborHash)) continue;
            visited.add(neighborHash);
            parents.set(neighborHash, currentHash);
            queue.push(neighborHash);
        }
    }

    return success({
        startHash,
        endHash,
        found,
        parents,
    });
}

export function getSearchResultDistance<THash>(
    result: GraphSearchResult<THash>
): number {
    if (!result.found) return -1;
    let distance = 0;
    let cur: THash | null = result.endHash;
    while (result.parents.get(cur) !== null) {
        cur = result.parents.get(cur)!;
        distance++;
    }
    return distance;
}

export function reconstructSearchResultPath<THash>(
    result: GraphSearchResult<THash>
): THash[] {
    const path: THash[] = [];
    if (!result.found) return path;
    let cur: Nullable<THash> = result.endHash;
    while (cur !== null) {
        path.push(cur);
        cur = result.parents.get(cur) ?? null;
    }
    return path.reverse();
}
