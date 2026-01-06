import {
    Day,
    Vec2,
    Printable,
    type Comparable,
    type Postionable,
    type Point,
    type Nullable,
    type Stringable,
} from "../../cl";

type AnyObj = Record<PropertyKey, unknown>;

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

// Get constructor from class
export type Ctor<C extends abstract new (...args: any) => any> = C;

// Create a constructor that is required to return a T
export type Class<T> = new (...args: any) => T;

interface Hashable<T> {
    hash(data?: T): string | number;
}

interface NodeableData extends Stringable {}

// Abstract Vertex implementation accepted by VertexGraph. Can easily
// be extended. That is actually the whole point of it.
abstract class Vertex<TData extends NodeableData, TProps extends AnyObj = never>
    implements Hashable<TData>
{
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

    abstract hash(data?: TData): string | number;

    toString(): string {
        return `Vertex: ${this.data.toString()}, edges: ${this.edges.map((e) =>
            e.next.data.toString()
        )}`;
    }
}

// Generic VertexGraph. It only knows about getting, finding and adding
// verticies and associated edges. It's very generic and allows for type-safe
// custom extensions. Can be used both for state-based and spatial-based graphs.
class VertexGraph<TNode extends Class<Vertex<any, any>>> extends Printable {
    #Vertex: Ctor<TNode>;
    #verticies: InstanceType<TNode>[];

    constructor(nodeCtor: TNode) {
        super();
        this.#Vertex = nodeCtor;
        this.#verticies = [];
    }

    get verticies(): readonly InstanceType<TNode>[] {
        return this.#verticies;
    }

    getVertex(p: InstanceType<TNode>["data"]): Nullable<InstanceType<TNode>> {
        return this.#verticies.find((e) => e.hash() === e.hash(p)) ?? null;
    }

    getVertexByHash(hash: string | number): Nullable<InstanceType<TNode>> {
        return this.#verticies.find((e) => e.hash() === hash) ?? null;
    }

    addVertex(...args: ConstructorParameters<TNode>): InstanceType<TNode> {
        const vertex = new this.#Vertex(...args) as InstanceType<TNode>;
        this.#verticies.push(vertex);
        return vertex;
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
        for (const vertex of this.verticies) {
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

// TODO not final this is just to play with vertex graph types
type MachineConfig = Uint8Array;

// TODO not final this is just to play with vertex graph types
type Machine = {
    desiredConfig: MachineConfig;
    lights: Uint8Array;
    buttons: number[];
    joltage: number[];
};

// TODO not final this is just to play with vertex graph types
class MachineVertexCustomProps extends Vertex<MachineConfig, {weight: number}> {
    constructor(data: MachineConfig) {
        super(data);
    }

    hash(data?: MachineConfig): string | number {
        // TODO not final this is just to play with vertex graph types
        return 0;
    }
}

// TODO not final this is just to play with vertex graph types
class MachineVertexNoProps extends Vertex<MachineConfig> {
    constructor(data: MachineConfig) {
        super(data);
    }

    hash(data?: MachineConfig): string {
        // TODO not final this is just to play with vertex graph types
        return "";
    }
}

const graph1 = new VertexGraph(MachineVertexCustomProps);
const graph2 = new VertexGraph(MachineVertexNoProps);

graph1.addEdgeFromData(null, null, {weight: 0});
graph1.getVertex()?.edges[0].next.edges[0];
graph2.addEdgeFromData(null, null);
graph2.getVertex()?.edges[0].next.edges[0];

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
