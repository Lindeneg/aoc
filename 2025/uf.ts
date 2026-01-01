import Printable, {type Stringable} from "./printable";

export const UF_MODE = {
    OBJECT: "OBJECT_KEYED",
    BIT: "BIT_PACKED",
} as const;

export type UfMode = (typeof UF_MODE)[keyof typeof UF_MODE];

export interface Uf<T = any> {
    find(x: T): T;
    findNonCompress(x: T): T;
    merge(x: T, y: T): number;
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

    find(x: T) {
        const parent = this.#parent.get(x)!;
        if (parent === x) return x;
        const closerParent: T = this.find(parent);
        // compress path to root
        this.#parent.set(x, closerParent);
        return closerParent;
    }

    findNonCompress(x: T) {
        // TODO maybe throw if cannot be found
        const parent = this.#parent.get(x)!;
        if (parent === x) return x;
        return this.find(parent);
    }

    merge(x: T, y: T) {
        const [xRoot, yRoot] = [this.find(x), this.find(y)];
        if (xRoot === yRoot) return this.#size.get(xRoot)!;
        const [xSize, ySize] = [this.#size.get(xRoot)!, this.#size.get(yRoot)!];
        let [bigger, smaller] = [xRoot, yRoot];
        if (xSize < ySize) {
            [bigger, smaller] = [yRoot, xRoot];
        }
        const newSize = xSize + ySize;
        this.#parent.set(smaller, bigger);
        this.#size.set(bigger, newSize);
        this.#size.delete(smaller);
        return newSize;
    }

    sizes() {
        return [...this.#size.values()].sort((a, b) => b - a);
    }

    toString() {
        const groups = new Map<T, Stringable[]>();

        for (const parent of this.#parent.keys()) {
            const root = this.findNonCompress(parent);
            if (!groups.has(root)) groups.set(root, []);
            groups.get(root)!.push(parent);
        }

        return [...groups.entries()]
            .sort(([, a], [, b]) => b.length - a.length)
            .reduce((acc, [root, members]) => {
                acc += `ROOT size:${members.length}=${this.#size.get(
                    root
                )!}, root:${root}\n`;
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
export class UfBitPacked extends Printable {
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

    find(x: number) {
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
        return root;
    }

    findNonCompress(x: number) {
        let root = x;
        while (this.#parent[root] >= 0) {
            root = this.#parent[root];
        }
        return root;
    }

    merge(a: number, b: number) {
        let rootA = this.find(a);
        let rootB = this.find(b);

        if (rootA === rootB) return -this.#parent[rootA];

        if (this.#parent[rootA] > this.#parent[rootB]) {
            [rootA, rootB] = [rootB, rootA];
        }

        this.#parent[rootA] += this.#parent[rootB];
        this.#parent[rootB] = rootA;

        return -this.#parent[rootA];
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
            const root = this.findNonCompress(i);
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
