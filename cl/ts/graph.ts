import Printable from "./printable";
import {errToStr, hasKey} from "./common";
import {success, failure, type Result} from "./result";
import type {Nullable, Class, AnyObj, Stringable} from "./types";

export const GRAPH_MODE = {
    /** Edges are one-directional */
    DIRECTED: 0,
    /** Edges are bidirectional */
    UNDIRECTED: 1,
} as const;

export type GraphMode = (typeof GRAPH_MODE)[keyof typeof GRAPH_MODE];

/**
 * Default parameters for addEdgeFromVertices when called with vertex instances.
 */
export type AddEdgeFromVerticiesDefaultParams<
    TNode extends Class<Nodeable<any, any>>,
> = [v0: InstanceType<TNode>, v1: InstanceType<TNode>];

/**
 * Default parameters for addEdgeFromData when called with vertex data.
 */
export type AddEdgeFromDataDefaultParams<
    TNode extends Class<Nodeable<any, any>>,
> = [d0: InstanceType<TNode>["data"], d1: InstanceType<TNode>["data"]];

/**
 * Extracts custom edge properties by excluding the required 'next' property.
 * If no custom properties exist, this resolves to never.
 */
export type ExcludeEdgeNext<TNode extends Class<Nodeable<any, any>>> = Omit<
    InstanceType<TNode>["edges"][number],
    "next"
>;

/**
 * Conditionally adds edge properties parameter if custom edge properties are defined.
 * If edges have no custom properties, only default params are required.
 * If edges have custom properties, an additional props parameter is added.
 *
 * ```ts
 * // Without custom edge properties:
 * // AddEdgeParams resolves to: [v0: Vertex, v1: Vertex]
 *
 * // With custom edge properties (e.g., {weight: number}):
 * // AddEdgeParams resolves to: [v0: Vertex, v1: Vertex, props: {weight: number}]
 * ```
 */
export type AddEdgeParams<
    TNode extends Class<Nodeable<any, any>>,
    TDefaultParams extends any[],
> = keyof ExcludeEdgeNext<TNode> extends never
    ? TDefaultParams
    : [...TDefaultParams, props: ExcludeEdgeNext<TNode>];

/**
 * Hash function type for converting vertex data to a unique identifier.
 */
export type HashFn<TNode extends Class<Nodeable<any, any>>, TReturn> = (
    data: InstanceType<TNode>["data"]
) => TReturn;

/**
 * Base type for vertex data (must be convertible to string).
 */
export interface NodeableData extends Stringable {}

/**
 * Interface for graph nodes with edges.
 *
 * Edges are conditionally typed:
 * - If TProps is never: edges    are: {next: Nodeable}
 * - If TProps is provided: edges are: {next: Nodeable} & TProps
 */
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

/**
 * Interface for graph implementations.
 *
 * Provides methods for vertex and edge management.
 * All graphs must support vertex lookup by hash and data.
 *
 * TODO: maybe extend Copyable interface
 */
export interface Graphable<
    TNode extends Class<Nodeable<any, any>> = any,
    THasher extends HashFn<TNode, any> = any,
> extends Printable {
    /** Iterator over all vertex hashes in the graph */
    get hashes(): MapIterator<ReturnType<THasher>>;

    /** The hash function used by this graph */
    get hash(): THasher;

    /** Gets a vertex by its data (hashes the data internally) */
    getVertex(p: InstanceType<TNode>["data"]): Nullable<InstanceType<TNode>>;
    /** Gets a vertex directly by its hash */
    getVertexByHash(hash: ReturnType<THasher>): Nullable<InstanceType<TNode>>;
    /** Adds a new vertex (fails if hash already exists) */
    addVertex(
        ...args: ConstructorParameters<TNode>
    ): Result<InstanceType<TNode>>;
    /** Adds or replaces a vertex, returning both new and old vertices */
    addVertexOverride(
        ...args: ConstructorParameters<TNode>
    ): Result<
        [
            newVertex: InstanceType<TNode>,
            oldVertex: Nullable<InstanceType<TNode>>,
        ]
    >;

    /** Adds an edge between two vertex instances */
    addEdgeFromVerticies(
        ...[v0, v1, props]: AddEdgeParams<
            TNode,
            AddEdgeFromVerticiesDefaultParams<TNode>
        >
    ): Result;

    /** Adds an edge by vertex data (looks up vertices internally) */
    addEdgeFromData(
        ...[p0, p1, props]: AddEdgeParams<
            TNode,
            AddEdgeFromDataDefaultParams<TNode>
        >
    ): Result;
}

/**
 * Abstract base class for graph vertices.
 *
 * Must be extended by concrete vertex classes. Provides base implementation
 * of Nodeable with automatic edge array initialization.
 *
 * Simple vertex
 * ```ts
 * class Position extends Vertex<Vec2> {
 *   constructor(pos: Vec2) {
 *     super(pos);
 *   }
 * }
 * ```
 *
 * Vertex with custom edge properties
 * ```ts
 * class WeightedVertex extends Vertex<string, {weight: number}> {
 *   constructor(data: string) {
 *     super(data);
 *   }
 * }
 * // Edges will have type: {next: WeightedVertex, weight: number}
 * ```
 */
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

/**
 * Result of a graph search operation.
 *
 * The parents map tracks the search tree for path reconstruction.
 * Note: parents.get(startHash) === null (the start has no parent).
 */
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

/**
 * Return type for expand functions.
 *
 * If edges have no custom properties: just return data
 * If edges have custom properties: return {data, ...props}
 *
 * Without custom edge properties
 * ```ts
 * // Return type is just: Vec2
 * expand: (v) => [new Vec2(v.data.x + 1, v.data.y)]
 * ```
 *
 * With custom edge properties
 * ```ts
 * // Return type is: {data: Vec2, weight: number}
 * expand: (v) => [{data: new Vec2(v.data.x + 1, v.data.y), weight: 5}]
 * ```
 */
export type ExpandReturn<TNode extends Class<Nodeable<any, any>>> =
    keyof ExcludeEdgeNext<TNode> extends never
        ? InstanceType<TNode>["data"]
        : {data: InstanceType<TNode>["data"]} & ExcludeEdgeNext<TNode>;

/**
 * Function type for dynamic neighbor generation during graph traversal.
 *
 * The expand function receives the current vertex and returns an iterable of neighbors.
 * Used by bfs() to build the graph on-the-fly during search.
 */
export type ExpandFn<TGraph extends Graphable> = (
    vertex: VertexFromGraph<TGraph>
) => Iterable<ExpandReturn<Class<VertexFromGraph<TGraph>>>>;

/**
 * Performs breadth-first search on a graph with optional dynamic expansion.
 *
 * When an expand function is provided, this function mutates the graph
 * by adding new vertices and edges as they are discovered during traversal.
 * This enables implicit graph construction.
 *
 * If you need the original graph unchanged, either don't use the expand function
 * and instead pre-build the graph) or copy the graph before calling bfs.
 *
 * Pre-built graph
 * ```ts
 * const graph = new VertexGraph(MyVertex, (d) => d.id);
 * graph.addVertex(data1);
 * graph.addVertex(data2);
 * graph.addEdgeFromData(data1, data2);
 *
 * const result = unwrap(bfs(graph, startHash, endHash));
 * if (result.found) {
 *   const path = reconstructSearchResultPath(result);
 * }
 * ```
 *
 * Dynamic expansion
 * ```ts
 * const graph = new VertexGraph(StateVertex, (s) => s.join(','), GRAPH_MODE.DIRECTED);
 * unwrap(graph.addVertex([0, 0, 0])); // Only add start state
 *
 * const result = unwrap(bfs(
 *   graph,
 *   "0,0,0",
 *   "1,1,1",
 *   // Expand function
 *   (vertex) => {
 *     // Generate neighbors on-the-fly
 *     return someDataArr.map(someData => {
 *       const next = vertex.data.slice();
 *       // ... modify next state based on someData
 *       return next;
 *     });
 *   }
 * ));
 * ```
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
            let expandResult: ReturnType<typeof expand>;
            try {
                expandResult = expand(currentVertex);
            } catch (e) {
                return failure(
                    `BFS: expand function threw exception: ${errToStr(e)}`
                );
            }

            for (const result of expandResult) {
                let data: VertexDataFromGraph<TGraph>;
                let props: AnyObj = {};

                if (hasKey(result, "data")) {
                    ({data, ...props} = result);
                } else {
                    data = result;
                }

                let nextHash: ReturnType<TGraph["hash"]>;
                try {
                    nextHash = graph.hash(data);
                } catch (e) {
                    return failure(
                        `BFS: hasher function threw exception: ${errToStr(e)}`
                    );
                }

                let nextVertex = graph.getVertexByHash(nextHash);
                if (!nextVertex) {
                    const addedVertexResult = graph.addVertex(data);
                    if (!addedVertexResult.ok) {
                        return failure(
                            `BFS: failed to add vertex ${nextHash} to graph: ${addedVertexResult.msg}`
                        );
                    }
                    nextVertex = addedVertexResult.data;
                }

                const edgeResult = graph.addEdgeFromVerticies(
                    currentVertex,
                    nextVertex,
                    props
                );
                if (!edgeResult.ok) {
                    return failure(
                        `BFS: failed to add edge from ${currentHash} to ${nextHash}: ${edgeResult.msg}`
                    );
                }
            }
        }

        for (const edge of currentVertex.edges) {
            const neighbor = edge.next;
            let neighborHash: ReturnType<TGraph["hash"]>;
            try {
                neighborHash = graph.hash(neighbor.data);
            } catch (e) {
                return failure(
                    `BFS: hasher function threw exception while processing edges: ${errToStr(
                        e
                    )}`
                );
            }
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

/** Calculates the shortest path distance from a BFS result. */
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

/**
 * Reconstructs the shortest path from a BFS result.
 *
 * The returned path includes both the start and end vertices.
 * The path is in forward order (start to end).
 */
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
