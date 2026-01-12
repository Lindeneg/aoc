import Printable from "./printable";
import {
    Vertex,
    GRAPH_MODE,
    type GraphMode,
    type Graphable,
    type HashFn,
    type AddEdgeParams,
    type AddEdgeFromDataDefaultParams,
    type AddEdgeFromVerticiesDefaultParams,
} from "./graph";
import {errToStr} from "./common";
import {success, failure, emptySuccess, type Result} from "./result";
import type {Class, Ctor, Nullable} from "./types";

/**
 * Generic graph implementation supporting custom vertex types and hash functions.
 *
 * Provides complete graph functionality with type-safe vertex and edge management.
 * Works for both spatial graphs (positions, grid cells) and state-space graphs
 * (game states, configurations).
 *
 * Simple spatial graph
 * ```ts
 * class Position extends Vertex<Vec2> {
 *   constructor(pos: Vec2) {
 *     super(pos);
 *   }
 *   toString() {
 *     return `${this.data}`;
 *   }
 * }
 *
 * const graph = new VertexGraph(
 *   Position,
 *   (pos) => `${pos.x},${pos.y}`  // Hash function (doesnt have to return string)
 * );
 *
 * unwrap(graph.addVertex(new Vec2(0, 0)));
 * unwrap(graph.addVertex(new Vec2(1, 0)));
 * unwrap(graph.addEdgeFromData(new Vec2(0, 0), new Vec2(1, 0)));
 * ```
 *
 * State-space graph with custom edge properties
 * ```ts
 * class State extends Vertex<number[], {cost: number}> {
 *   constructor(data: number[]) {
 *     super(data);
 *   }
 * }
 *
 * const graph = new VertexGraph(
 *   State,
 *   (state) => state.join(','),
 *   GRAPH_MODE.DIRECTED
 * );
 *
 * const s1 = unwrap(graph.addVertex([0, 0]));
 * const s2 = unwrap(graph.addVertex([1, 0]));
 * unwrap(graph.addEdgeFromVerticies(s1, s2, {cost: 5}));
 * ```
 */
class VertexGraph<
        TNode extends Class<Vertex<any, any>>,
        THasher extends HashFn<TNode, any>,
    >
    extends Printable
    implements Graphable<TNode, THasher>
{
    #Vertex: Ctor<TNode>;
    #vertices: Map<ReturnType<THasher>, InstanceType<TNode>>;
    #hasher: THasher;
    #mode: GraphMode;

    constructor(
        nodeCtor: TNode,
        hasher: THasher,
        mode: GraphMode = GRAPH_MODE.UNDIRECTED
    ) {
        super();
        this.#Vertex = nodeCtor;
        this.#hasher = hasher;
        this.#mode = mode;
        this.#vertices = new Map();
    }

    get hash() {
        return this.#hasher;
    }

    get hashes() {
        return this.#vertices.keys() as MapIterator<ReturnType<THasher>>;
    }

    getVertex(p: InstanceType<TNode>["data"]): Nullable<InstanceType<TNode>> {
        try {
            const hash = this.#hasher(p);
            return this.#vertices.get(hash) ?? null;
        } catch (e) {
            // If hasher throws, we can't find the vertex
            return null;
        }
    }

    getVertexByHash(hash: ReturnType<THasher>): Nullable<InstanceType<TNode>> {
        return this.#vertices.get(hash) ?? null;
    }

    addVertex(
        ...args: ConstructorParameters<TNode>
    ): Result<InstanceType<TNode>, {hash?: ReturnType<THasher>}> {
        let vertex: InstanceType<TNode>;
        try {
            vertex = new this.#Vertex(...args) as InstanceType<TNode>;
        } catch (e) {
            return failure(
                `VERTEX-GRAPH: failed to construct vertex: ${errToStr(e)}`,
                {}
            );
        }
        try {
            const hash = this.#hasher(vertex.data);
            if (this.#vertices.has(hash)) {
                return failure("VERTEX-GRAPH: vertex already exist: " + hash, {
                    hash,
                });
            }
            this.#vertices.set(hash, vertex);
            return success(vertex);
        } catch (e) {
            return failure(
                `VERTEX-GRAPH: hasher function threw exception: ${errToStr(e)}`,
                {}
            );
        }
    }

    addVertexOverride(
        ...args: ConstructorParameters<TNode>
    ): Result<
        [
            newVertex: InstanceType<TNode>,
            oldVertex: Nullable<InstanceType<TNode>>,
        ]
    > {
        let vertex: InstanceType<TNode>;
        try {
            vertex = new this.#Vertex(...args) as InstanceType<TNode>;
        } catch (e) {
            return failure(
                `VERTEX-GRAPH: failed to construct vertex: ${errToStr(e)}`
            );
        }
        try {
            const hash = this.#hasher(vertex.data);
            let old: Nullable<InstanceType<TNode>> = null;
            if (this.#vertices.has(hash)) {
                // TODO: remove old edge connections
                old = this.#vertices.get(hash)!;
            }
            this.#vertices.set(hash, vertex);
            return success([vertex, old]);
        } catch (e) {
            return failure(
                `VERTEX-GRAPH: hasher function threw exception: ${errToStr(e)}`
            );
        }
    }

    addEdgeFromVerticies(
        ...[v0, v1, props]: AddEdgeParams<
            TNode,
            AddEdgeFromVerticiesDefaultParams<TNode>
        >
    ): Result {
        try {
            const p = props || {};
            v0.edges.push({next: v1, ...p});
            if (this.#mode === GRAPH_MODE.UNDIRECTED) {
                v1.edges.push({next: v0, ...p});
            }
            return emptySuccess();
        } catch (e) {
            return failure(`VERTEX-GRAPH: failed to add edge: ${errToStr(e)}`);
        }
    }

    addEdgeFromData(
        ...[p0, p1, props]: AddEdgeParams<
            TNode,
            AddEdgeFromDataDefaultParams<TNode>
        >
    ): Result {
        const v0 = this.getVertex(p0);
        if (!v0) {
            return failure(`VERTEX-GRAPH: vertex not found for data: ${p0}`);
        }
        const v1 = this.getVertex(p1);
        if (!v1) {
            return failure(`VERTEX-GRAPH: vertex not found for data: ${p1}`);
        }
        const args = [v0, v1, props] as AddEdgeParams<
            TNode,
            AddEdgeFromDataDefaultParams<TNode>
        >;
        return this.addEdgeFromVerticies(...args);
    }

    toString(): string {
        let str = "";
        for (const hash of this.hashes) {
            const vertex = this.getVertexByHash(hash)!;
            let edges = "";
            for (const {next, ...rest} of vertex.edges) {
                edges += `- ${next} ${JSON.stringify(rest)}\n`;
            }
            str += `Vertex ${vertex}\n`;
            if (edges.length > 0) {
                str += `${edges}`;
            }
        }
        return str;
    }
}

export default VertexGraph;
