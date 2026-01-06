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

export function bfs<
    TNode extends Class<Nodeable<any, any>> = any,
    THasher extends HashFn<TNode, any> = any,
>(
    graph: Graphable<TNode, THasher>,
    start: InstanceType<TNode> | ReturnType<THasher>,
    end: InstanceType<TNode> | ReturnType<THasher>
) {
    let startHash: ReturnType<THasher>;
    if ("data" in start && "vertices" in start && "edges" in start) {
        startHash = graph.hash(start);
    } else {
        startHash = start as ReturnType<THasher>;
    }
    let endHash: ReturnType<THasher>;
    if ("data" in end && "vertices" in end && "edges" in end) {
        end = graph.hash(end);
    } else {
        end = end as ReturnType<THasher>;
    }
}
