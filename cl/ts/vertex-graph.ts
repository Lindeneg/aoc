import Printable from "./printable";
import {
    Vertex,
    type Graphable,
    type HashFn,
    type AddEdgeParams,
    type AddEdgeFromDataDefaultParams,
    type AddEdgeFromVerticiesDefaultParams,
} from "./graph";
import type {Class, Ctor, Nullable} from "./types";

// Generic VertexGraph. It only knows about getting, finding and adding
// verticies and associated edges. It's very generic and allows for type-safe
// custom extensions. Can be used both for state-based and spatial-based graphs.
class VertexGraph<
        TNode extends Class<Vertex<any, any>>,
        THasher extends HashFn<TNode, any>,
    >
    extends Printable
    implements Graphable<TNode, ReturnType<THasher>>
{
    #Vertex: Ctor<TNode>;
    #vertices: Map<ReturnType<THasher>, InstanceType<TNode>>;
    #hasher: THasher;

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

export default VertexGraph;
