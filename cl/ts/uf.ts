import Printable from "./printable";
import {success, failure, type Result} from "./result";
import type {Stringable} from "./types";

export const UF_MODE = {
    OBJECT: "OBJECT_KEYED",
    BIT: "BIT_PACKED",
} as const;

export type UfMode = (typeof UF_MODE)[keyof typeof UF_MODE];

export interface Uf<T = any> {
    find(x: T): Result<T>;
    findNonCompress(x: T): Result<T>;
    merge(x: T, y: T): Result<number>;
    sizes(): number[];
}

export class UfObjectKeyed<T extends Stringable>
    extends Printable
    implements Uf<T>
{
    #parent: Map<T, T>;
    #size: Map<T, number>;

    constructor(iterableData: Iterable<T>) {
        super();
        this.#parent = new Map();
        this.#size = new Map();

        for (const el of iterableData) this.makeSet(el);
    }

    makeSet(x: T) {
        if (this.#parent.has(x)) return;
        this.#parent.set(x, x);
        this.#size.set(x, 1);
    }

    find(x: T): Result<T> {
        const parent = this.#parent.get(x);
        if (parent === undefined) {
            return failure(
                `UF-OBJECT-KEYED: element ${x} not found in union-find structure`
            );
        }
        if (parent === x) return success(x);
        const closerParentResult = this.find(parent);
        if (!closerParentResult.ok) return closerParentResult;
        const closerParent = closerParentResult.data;
        // compress path to root
        this.#parent.set(x, closerParent);
        return success(closerParent);
    }

    findNonCompress(x: T): Result<T> {
        if (!this.#parent.has(x)) {
            return failure(
                `UF-OBJECT-KEYED: element ${x} not found in union-find structure`
            );
        }
        let current = x;
        let parent = this.#parent.get(current);
        while (parent !== undefined && parent !== current) {
            current = parent;
            parent = this.#parent.get(current);
        }
        return success(current);
    }

    merge(x: T, y: T): Result<number> {
        const xRootResult = this.find(x);
        if (!xRootResult.ok) return xRootResult;
        const yRootResult = this.find(y);
        if (!yRootResult.ok) return yRootResult;

        const xRoot = xRootResult.data;
        const yRoot = yRootResult.data;

        if (xRoot === yRoot) {
            const size = this.#size.get(xRoot);
            if (size === undefined) {
                return failure(
                    `UF-OBJECT-KEYED: size not found for root ${xRoot}`
                );
            }
            return success(size);
        }

        const xSize = this.#size.get(xRoot);
        const ySize = this.#size.get(yRoot);
        if (xSize === undefined || ySize === undefined) {
            return failure(`UF-OBJECT-KEYED: size not found for roots`);
        }

        let [bigger, smaller] = [xRoot, yRoot];
        if (xSize < ySize) {
            [bigger, smaller] = [yRoot, xRoot];
        }
        const newSize = xSize + ySize;
        this.#parent.set(smaller, bigger);
        this.#size.set(bigger, newSize);
        this.#size.delete(smaller);
        return success(newSize);
    }

    sizes() {
        return [...this.#size.values()].sort((a, b) => b - a);
    }

    toString() {
        const groups = new Map<T, Stringable[]>();

        for (const parent of this.#parent.keys()) {
            const rootResult = this.findNonCompress(parent);
            if (!rootResult.ok) continue;
            const root = rootResult.data;
            if (!groups.has(root)) groups.set(root, []);
            groups.get(root)!.push(parent);
        }

        return [...groups.entries()]
            .sort(([, a], [, b]) => b.length - a.length)
            .reduce((acc, [root, members]) => {
                const size = this.#size.get(root) ?? 0;
                acc += `ROOT size:${members.length}=${size}, root:${root}\n`;
                if (members.length > 1) {
                    for (const m of members) {
                        acc += `  ${m}\n`;
                    }
                }
                return acc;
            }, "");
    }
}

// i just wanna see how much better this performs
export class UfBitPacked extends Printable implements Uf<number> {
    // if negative n, then node is root and size is -n
    // if positive n, then node belongs to root at index n
    #parent: Int32Array;
    // used in toString for debugging
    #getEl: (idx: number) => Stringable;

    constructor(count: number, getEl?: (idx: number) => Stringable) {
        super();
        this.#parent = new Int32Array(count);
        this.#parent.fill(-1);
        this.#getEl =
            typeof getEl === "function" ? getEl : (idx: number) => idx;
    }

    find(x: number): Result<number> {
        if (x < 0 || x >= this.#parent.length) {
            return failure(
                `UF-BIT-PACKED: index ${x} out of bounds [0, ${this.#parent.length})`
            );
        }
        let root = x;
        while (this.#parent[root] >= 0) {
            root = this.#parent[root];
        }
        // compress path to root
        while (x !== root) {
            const p = this.#parent[x];
            this.#parent[x] = root;
            x = p;
        }
        return success(root);
    }

    findNonCompress(x: number): Result<number> {
        if (x < 0 || x >= this.#parent.length) {
            return failure(
                `UF-BIT-PACKED: index ${x} out of bounds [0, ${this.#parent.length})`
            );
        }
        let root = x;
        while (this.#parent[root] >= 0) {
            root = this.#parent[root];
        }
        return success(root);
    }

    merge(a: number, b: number): Result<number> {
        const rootAResult = this.find(a);
        if (!rootAResult.ok) return rootAResult;
        const rootBResult = this.find(b);
        if (!rootBResult.ok) return rootBResult;

        let rootA = rootAResult.data;
        let rootB = rootBResult.data;

        if (rootA === rootB) return success(-this.#parent[rootA]);

        if (this.#parent[rootA] > this.#parent[rootB]) {
            [rootA, rootB] = [rootB, rootA];
        }

        this.#parent[rootA] += this.#parent[rootB];
        this.#parent[rootB] = rootA;

        return success(-this.#parent[rootA]);
    }

    sizes() {
        const out = [];
        for (let i = 0; i < this.#parent.length; i++) {
            if (this.#parent[i] < 0) {
                out.push(-this.#parent[i]);
            }
        }
        return out.sort((a, b) => b - a);
    }

    toString() {
        const groups = new Map<number, Stringable[]>();

        for (let i = 0; i < this.#parent.length; i++) {
            const rootResult = this.findNonCompress(i);
            if (!rootResult.ok) continue;
            const root = rootResult.data;
            if (!groups.has(root)) groups.set(root, []);
            groups.get(root)!.push(this.#getEl(i));
        }

        return [...groups.entries()]
            .sort(([, a], [, b]) => b.length - a.length)
            .reduce((acc, [root, members]) => {
                acc += `ROOT idx:${root}, size:${members.length}=${-this
                    .#parent[root]}, root:${this.#getEl(root)}\n`;
                if (members.length > 1) {
                    for (const m of members) {
                        acc += `  ${m}\n`;
                    }
                }
                return acc;
            }, "");
    }
}
