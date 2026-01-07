import Printable from "./printable";
import type {Nullable, Class, AnyObj, Stringable} from "./types";

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
    addVertex(...args: ConstructorParameters<TNode>): InstanceType<TNode>;
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

/** Traversel functions that works with Graphable graphs */

// Simple search result that can be used across searching algorithms.
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

export function bfs<TGraph extends Graphable>(
    graph: TGraph,
    startHash: ReturnType<TGraph["hash"]>,
    endHash: ReturnType<TGraph["hash"]>,
    expand?: ExpandFn<TGraph>
): GraphSearchResult<ReturnType<TGraph["hash"]>> {
    const parents = new Map<
        ReturnType<TGraph["hash"]>,
        Nullable<ReturnType<TGraph["hash"]>>
    >();

    if (startHash === endHash) {
        parents.set(startHash, null);
        return {
            startHash,
            endHash,
            found: true,
            parents,
        };
    }

    const visited = new Set<ReturnType<TGraph["hash"]>>();
    const queue: Array<ReturnType<TGraph["hash"]>> = [];

    const startVertex = graph.getVertexByHash(startHash);
    if (!startVertex) {
        return {
            startHash,
            endHash,
            found: false,
            parents,
        };
    }

    visited.add(startHash);
    parents.set(startHash, null);
    queue.push(startHash);

    let found = false;
    while (queue.length > 0) {
        // TODO:
        // O(n) per shift due to array reindexing.
        // could use index-based queue instead - or a dequeue.
        const currentHash = queue.shift()!;
        if (currentHash === endHash) {
            found = true;
            break;
        }
        const currentVertex = graph.getVertexByHash(currentHash)!;

        if (typeof expand === "function") {
            for (const result of expand(currentVertex)) {
                let data: VertexDataFromGraph<TGraph>;
                let props: AnyObj = {};

                if (
                    typeof result === "object" &&
                    result !== null &&
                    "data" in result
                ) {
                    ({data, ...props} = result);
                } else {
                    data = result;
                }
                const nextHash = graph.hash(data);

                let nextVertex = graph.getVertexByHash(nextHash);
                if (!nextVertex) {
                    nextVertex = graph.addVertex(data);
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

    return {
        startHash,
        endHash,
        found,
        parents,
    };
}

// One thing to note:
// distance === -1 when found === false.
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
