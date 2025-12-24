import {performance} from "node:perf_hooks";
import fs from "fs/promises";
import pathMod from "path";

const FILE_CACHE = new Map();

const ROOT_PATH = process.argv[2];

class TestFail extends Error {
    constructor(p, c, g, e) {
        super(`TEST FAIL: '${p}' part ${c} got: ${g} want: ${e}`);
    }
}

function makePart(part) {
    return {one: part === 1, two: part === 2};
}

export default function (fn, puzzles, ...examples) {
    // TODO detect os and set accordingly
    const split = "\r\n";

    let transform = function (s) {
        return s.toString().trimEnd().split(split);
    };

    async function readInput(path) {
        const absPath = pathMod.join(ROOT_PATH, path);
        if (FILE_CACHE.has(absPath)) return FILE_CACHE.get(absPath);
        const buf = await fs.readFile(absPath);
        const transformed = transform(buf, split);
        FILE_CACHE.set(absPath, transformed);
        return transformed;
    }

    function isTarget(part, n) {
        return part === 0 || part === n;
    }

    async function evaluate(config, part, isExample) {
        // TODO time the function and print the result and the timing
        const input = await readInput(config.path);

        const start = performance.now();
        const got = await fn(input, makePart(part));
        const timing = (performance.now() - start).toFixed(3) + "ms";
        if (got !== config.want) {
            throw new TestFail(config.path, part, got, config.want);
        }
        const txt = isExample ? "EXAMPLE" : "PUZZLE ";
        console.log(`(${timing}) ${txt} ${part}: ${got}`);
    }

    async function evaluateParts([part1, part2], part, isExample = false) {
        if (isTarget(part, 1)) {
            await evaluate(part1, 1, isExample);
        }
        if (isTarget(part, 2)) {
            await evaluate(part2, 2, isExample);
        }
    }

    return {
        async run(part = 0) {
            await evaluateParts(puzzles, part);
        },

        async examples(part = 0) {
            for (const example of examples) {
                await evaluateParts(example, part, true);
            }
        },

        setTransform(fn) {
            transform = fn;
        },
    };
}
