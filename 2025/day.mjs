import {performance} from "node:perf_hooks";
import fs from "fs/promises";
import pathMod from "path";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

const FILE_CACHE = new Map();

const ROOT_PATH = process.argv[2];

const DEFAULT_PATH = ["puzzle.in", "example.in"];

function getPath(config, isExample) {
    if (
        config === null ||
        typeof config === "number" ||
        typeof config === "bigint"
    ) {
        return DEFAULT_PATH[Number(isExample)];
    }
    return config.path;
}

function getWant(config) {
    if (
        config === null ||
        typeof config === "number" ||
        typeof config === "bigint"
    ) {
        return config;
    }
    return config.want;
}

function makePart(part) {
    return {one: part === 1, two: part === 2};
}

export default function (fn, puzzles, ...examples) {
    // TODO detect os and set accordingly
    let split = "\r\n";

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

    async function evaluate(config, part, isExample, silent = false) {
        const p = getPath(config, isExample);
        const want = getWant(config);
        const input = await readInput(p);
        const start = performance.now();
        const got = await fn(input, makePart(part));
        const timing = (performance.now() - start).toFixed(3) + "ms";

        if (silent) return;

        const txt = isExample ? "EXAMPLE" : "PUZZLE ";
        if (got !== want) {
            console.log(
                `${RED}FAIL${RESET} ${txt} ${part}: got=${got} want=${want}`
            );
        } else {
            console.log(
                `${GREEN}PASS${RESET} ${txt} ${part}: ${got} (${timing})`
            );
        }
    }

    async function evaluateParts(
        [part1, part2],
        part,
        isExample = false,
        silent = false
    ) {
        if (isTarget(part, 1)) {
            await evaluate(part1, 1, isExample, silent);
        }
        if (isTarget(part, 2)) {
            await evaluate(part2, 2, isExample, silent);
        }
    }

    return {
        async run(part = 0, silent = false) {
            await evaluateParts(puzzles, part, false, silent);
        },

        async examples(part = 0, silent = false) {
            for (const example of examples) {
                await evaluateParts(example, part, true, silent);
            }
        },

        setTransform(fn) {
            transform = fn;
        },

        setSplit(s) {
            split = s;
        },
    };
}
