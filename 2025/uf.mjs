import Printable from "./printable.mjs";

export const UF_MODE = {
    OBJECT: "OBJECT_KEYED",
    BIT: "BIT_PACKED",
};

export class UfObjectKeyed {
    constructor(iterableData) {
        this.parent = new Map();
        this.size = new Map();

        for (const el of iterableData) this.makeSet(el);
    }

    makeSet(x) {
        if (this.parent.has(x)) return;
        this.parent.set(x, x);
        this.size.set(x, 1);
    }

    find(x) {
        const parent = this.parent.get(x);
        if (parent === x) return x;
        const closerParent = this.find(parent);
        // compress path to root
        this.parent.set(x, closerParent);
        return closerParent;
    }

    merge(x, y) {
        const [xRoot, yRoot] = [this.find(x), this.find(y)];
        if (xRoot === yRoot) return this.size.get(xRoot);
        const [xSize, ySize] = [this.size.get(xRoot), this.size.get(yRoot)];
        let [bigger, smaller] = [xRoot, yRoot];
        if (xSize < ySize) {
            [bigger, smaller] = [yRoot, xRoot];
        }
        const newSize = xSize + ySize;
        this.parent.set(smaller, bigger);
        this.size.set(bigger, newSize);
        this.size.delete(smaller);
        return newSize;
    }

    sizes() {
        return [...this.size.values()].sort((a, b) => b - a);
    }
}

// i just wanna see how much better this performs
export class UfBitPacked extends Printable {
    constructor(count, data = null) {
        super();
        this.data = data;
        // if negative n, then node is root and size is -n
        // if positive n, then node belongs to root at index n
        this.parent = new Int32Array(count);
        this.parent.fill(-1);
    }

    find(x) {
        let root = x;
        while (this.parent[root] >= 0) {
            root = this.parent[root];
        }
        // compress path to root
        while (x !== root) {
            const p = this.parent[x];
            this.parent[x] = root;
            x = p;
        }
        return root;
    }

    findNonCompress(x) {
        let root = x;
        while (this.parent[root] >= 0) {
            root = this.parent[root];
        }
        return root;
    }

    merge(a, b) {
        let rootA = this.find(a);
        let rootB = this.find(b);

        if (rootA === rootB) return -this.parent[rootA];

        if (this.parent[rootA] > this.parent[rootB]) {
            [rootA, rootB] = [rootB, rootA];
        }

        this.parent[rootA] += this.parent[rootB];
        this.parent[rootB] = rootA;

        return -this.parent[rootA];
    }

    sizes() {
        const out = [];
        for (let i = 0; i < this.parent.length; i++) {
            if (this.parent[i] < 0) {
                out.push(-this.parent[i]);
            }
        }
        return out.sort((a, b) => b - a);
    }

    toString() {
        const groups = new Map();

        for (let i = 0; i < this.parent.length; i++) {
            const root = this.findNonCompress(i);
            if (!groups.has(root)) groups.set(root, []);
            groups.get(root).push(this.data[i]);
        }

        return [...groups.entries()]
            .sort(([, a], [, b]) => b.length - a.length)
            .reduce((acc, [root, members]) => {
                acc += `ROOT idx:${root}, size:${members.length}=${-this.parent[
                    root
                ]}, vec:${this.data[root]}\n`;
                for (const m of members) {
                    acc += `  ${m}\n`;
                }
                return acc;
            }, "");
    }
}

export default function makeUfFromMode(mode, prop, data = null) {
    switch (mode) {
        case UF_MODE.BIT:
            return new UfBitPacked(prop, data);
        case UF_MODE.OBJECT:
            return new UfObjectKeyed(prop);
        default:
            throw new Error("INVALID MODE: " + mode);
    }
}
