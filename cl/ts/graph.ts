import Printable from "./printable";
import type {Nullable, Class, AnyObj, Stringable, Ctor} from "./types";

// Default AddEdge parameters from verticies
type AddEdgeFromVerticiesDefaultParams<TNode extends Class<Vertex<any, any>>> =
    [v0: InstanceType<TNode>, v1: InstanceType<TNode>];

// Default AddEdge parameters from data
type AddEdgeFromDataDefaultParams<TNode extends Class<Vertex<any, any>>> = [
    d0: InstanceType<TNode>["data"],
    d1: InstanceType<TNode>["data"],
];

// Removes the next property from edges to such that
// we can check if any custom edge properties has been added
type ExcludeEdgeNext<TNode extends Class<Vertex<any, any>>> = Omit<
    InstanceType<TNode>["edges"][number],
    "next"
>;

// If custom props are provided to an edge, we extract that
// so we can use it for function parameters. If none is provided
// we only use the default required parameters.
type AddEdgeParams<
    TNode extends Class<Vertex<any, any>>,
    TDefaultParams extends any[],
> = keyof ExcludeEdgeNext<TNode> extends never
    ? TDefaultParams
    : [...TDefaultParams, props: ExcludeEdgeNext<TNode>];

type HashFn<TNode extends Class<Vertex<any, any>>> = (
    data: InstanceType<TNode>["data"]
) => string | number;

interface NodeableData extends Stringable {}

// Abstract Vertex implementation accepted by VertexGraph. Can easily
// be extended. That is actually the whole point of it.
export abstract class Vertex<
    TData extends NodeableData,
    TProps extends AnyObj = never,
> {
    readonly data: TData;
    readonly edges: Array<
        [TProps] extends [never]
            ? {next: Vertex<TData, TProps>}
            : {next: Vertex<TData, TProps>} & TProps
    >;

    constructor(data: TData) {
        this.data = data;
        this.edges = [];
    }

    toString(): string {
        return `Vertex: ${this.data.toString()}, edges: ${this.edges.map((e) =>
            e.next.data.toString()
        )}`;
    }
}

// Generic VertexGraph. It only knows about getting, finding and adding
// verticies and associated edges. It's very generic and allows for type-safe
// custom extensions. Can be used both for state-based and spatial-based graphs.
export class VertexGraph<
    TNode extends Class<Vertex<any, any>>,
    THasher extends HashFn<TNode>,
> extends Printable {
    #Vertex: Ctor<TNode>;
    #vertices: Map<string | number, InstanceType<TNode>>;
    #hasher: HashFn<TNode>;

    constructor(nodeCtor: TNode, hasher: THasher) {
        super();
        this.#Vertex = nodeCtor;
        this.#hasher = hasher;
        this.#vertices = new Map();
    }

    get hashes() {
        return this.#vertices.keys() as MapIterator<ReturnType<THasher>>;
    }

    getVertex(p: InstanceType<TNode>["data"]): Nullable<InstanceType<TNode>> {
        const hash = this.#hasher(p);
        return this.#vertices.get(hash) ?? null;
    }

    getVertexByHash(hash: ReturnType<THasher>): Nullable<InstanceType<TNode>> {
        return this.#vertices.get(hash) ?? null;
    }

    addVertex(...args: ConstructorParameters<TNode>): InstanceType<TNode> {
        const vertex = new this.#Vertex(...args) as InstanceType<TNode>;
        const hash = this.#hasher(vertex.data);
        if (this.#vertices.has(hash)) {
            throw new Error(
                "GraphInserstionError: vertex already exist: " + hash
            );
        }
        this.#vertices.set(hash, vertex);
        return vertex;
    }

    addVertexOverride(
        ...args: ConstructorParameters<TNode>
    ): [
        newVertex: InstanceType<TNode>,
        oldVertex: Nullable<InstanceType<TNode>>,
    ] {
        const vertex = new this.#Vertex(...args) as InstanceType<TNode>;
        const hash = this.#hasher(vertex.data);
        let old: Nullable<InstanceType<TNode>> = null;
        if (this.#vertices.has(hash)) {
            old = this.#vertices.get(hash)!;
        }
        this.#vertices.set(hash, vertex);
        return [vertex, old];
    }

    addEdgeFromVerticies(
        ...[v0, v1, props]: AddEdgeParams<
            TNode,
            AddEdgeFromVerticiesDefaultParams<TNode>
        >
    ) {
        const p = props || {};
        v0.edges.push({next: v1, ...p});
        v1.edges.push({next: v0, ...p});
    }

    addEdgeFromData(
        ...[p0, p1, props]: AddEdgeParams<
            TNode,
            AddEdgeFromDataDefaultParams<TNode>
        >
    ): boolean {
        const v0 = this.getVertex(p0);
        if (!v0) return false;
        const v1 = this.getVertex(p1);
        if (!v1) return false;
        const args = [v0, v1, props] as AddEdgeParams<
            TNode,
            AddEdgeFromDataDefaultParams<TNode>
        >;
        this.addEdgeFromVerticies(...args);
        return true;
    }

    toString(): string {
        let str = "";
        for (const hash of this.hashes) {
            const vertex = this.getVertexByHash(hash)!;
            let edges = "";
            for (const {next, ...rest} of vertex.edges) {
                edges += `- ${next.data} ${JSON.stringify(rest)}\n`;
            }
            str += `Vertex ${vertex.data}\n`;
            if (edges.length > 0) {
                str += `${edges}`;
            }
        }
        return str;
    }
}
