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

type AddEdgeFromVerticiesParams<TNode extends Class<Vertex<any, any>>> =
    keyof Omit<InstanceType<TNode>["edges"][number], "next"> extends never
        ? [p0: InstanceType<TNode>, p1: InstanceType<TNode>]
        : [
              p0: InstanceType<TNode>,
              p1: InstanceType<TNode>,
              props: ExcludeEdgeNext<TNode>,
          ];

type AddEdgeFromDataParams<TNode extends Class<Vertex<any, any>>> = keyof Omit<
    InstanceType<TNode>["edges"][number],
    "next"
> extends never
    ? [p0: InstanceType<TNode>["data"], p1: InstanceType<TNode>["data"]]
    : [
          p0: InstanceType<TNode>["data"],
          p1: InstanceType<TNode>["data"],
          props: ExcludeEdgeNext<TNode>,
      ];

// Get constructor from class
export type Ctor<C extends abstract new (...args: any) => any> = C;

// Create placeholder constructor for interface
export type Class<T> = new (...args: any) => T;

interface Hashable {
    hash(): string | number;
}

interface NodeableData extends Stringable {}

type ExcludeEdgeNext<TNode extends Class<Vertex<any, any>>> = Omit<
    InstanceType<TNode>["edges"][number],
    "next"
>;

// Default Vertex implementation. Can easily be extended.
abstract class Vertex<TData extends NodeableData, TProps extends AnyObj = never>
    implements Hashable
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

    abstract hash(): string | number;

    toString(): string {
        return `Vertex: ${this.data.toString()}, edges: ${this.edges.map((e) =>
            e.next.data.toString()
        )}`;
    }
}

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
        this.#verticies[0].data;
        return this.#verticies.find((e) => e.data.equals(p)) ?? null;
    }

    addVertex(...args: ConstructorParameters<TNode>): InstanceType<TNode> {
        const vertex = new this.#Vertex(...args) as InstanceType<TNode>;
        this.#verticies.push(vertex);
        return vertex;
    }

    addEdgeFromVerticies(
        ...[v0, v1, props]: AddEdgeFromVerticiesParams<TNode>
    ) {
        const p = props || {};
        v0.edges.push({next: v1, ...p});
        v1.edges.push({next: v0, ...p});
    }

    addEdgeFromData(...[p0, p1, props]: AddEdgeFromDataParams<TNode>): boolean {
        const v0 = this.getVertex(p0);
        if (!v0) return false;
        const v1 = this.getVertex(p1);
        if (!v1) return false;
        const args = [v0, v1, props] as AddEdgeFromDataParams<TNode>;
        this.addEdgeFromVerticies(...args);
        return true;
    }

    toString(): string {
        let str = "";
        for (const vertex of this.verticies) {
            let edges = "";
            for (const {next, ...rest} of vertex.edges) {
                edges += `- ${next.pos} ${JSON.stringify(rest)}\n`;
            }
            str += `Vertex ${vertex.data}\n`;
            if (edges.length > 0) {
                str += `${edges}`;
            }
        }
        return str;
    }
}

type MachineConfig = Uint8Array;

class MachineVertex extends Vertex<MachineConfig, {weight: number}> {
    constructor(data: MachineConfig) {
        super(data);
    }

    hash(): string | number {
        // TODO: do an actual hash..
        return 0;
    }
}

class MachineVertex2 extends Vertex<MachineConfig> {
    constructor(data: MachineConfig) {
        super(data);
    }

    hash(): string {
        // TODO: do an actual hash..
        return "";
    }
}

type Machine = {
    desiredConfig: MachineConfig;
    lights: Uint8Array;
    buttons: number[];
    joltage: number[];
};

const k = new VertexGraph(MachineVertex);
const kk = new VertexGraph(MachineVertex2);

k.addEdgeFromVerticies(
    new MachineVertex([] as any),
    new MachineVertex([] as any),
    {weight: 1}
);

kk.addEdgeFromVerticies(
    new MachineVertex2([] as any),
    new MachineVertex2([] as any)
);

k.addEdgeFromData([] as any, [] as any, {weight: 1});
kk.addEdgeFromData([] as any, [] as any);

k.verticies[0].edges[0].next.edges[0].next.edges[0].;
kk.verticies[0].edges[0].next.edges[0].next;

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
