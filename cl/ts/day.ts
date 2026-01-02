import {performance} from "node:perf_hooks";
import fs from "fs/promises";
import pathMod from "path";
import type {Nullable, AnyFn} from "./types";

type Part = Record<"one" | "two" | "isExample", boolean>;

type ConfigObj<T> = {path: string; want: T};
type Config<T> = Nullable<ConfigObj<T> | T>;
type DayConfig<T> = T extends Result
    ? [Config<T["data"]>, Config<T["data"]>]
    : [Config<T>, Config<T>];

type CtxFromParams<T extends AnyFn> = Parameters<T> extends [
    any,
    any,
    ...infer Rest,
]
    ? Rest
    : never;

type DataFromParams<T extends AnyFn> = Parameters<T>[1];

type SolveFn<TData = any, TReturn = any, TArgs extends Array<any> = any> = (
    part: Part,
    data: TData,
    ...args: TArgs
) => TReturn;

type Transform = (s: Buffer, split: RegExp | string) => string[];
type PostTransform<TVal, TArgs extends Array<any>> = (
    s: string[],
    ...args: TArgs
) => TVal;

type PostTransformFn<T extends AnyFn> = PostTransform<
    DataFromParams<T>,
    CtxFromParams<T>
>;

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

const ROOT_PATH = process.argv[2] as string;

const DEFAULT_PATH = ["puzzle.in", "example.in"] as const;

// just to make it easier if the solve function
// wants to return some extra context for logging
export class Result<TData = any> {
    data: TData;
    ctx: unknown;

    constructor(data: TData, ctx: unknown) {
        this.data = data;
        this.ctx = ctx;
    }
}

class Day<T extends SolveFn> {
    #fn: T;
    #puzzles: DayConfig<ReturnType<T>>;
    #examples: DayConfig<ReturnType<T>>[];
    #split: RegExp | string;
    #transform: Transform;
    #postTransform: Nullable<PostTransformFn<T>>;

    constructor(
        fn: T,
        puzzles: DayConfig<ReturnType<T>>,
        ...examples: DayConfig<ReturnType<T>>[]
    ) {
        this.#fn = fn;
        this.#puzzles = puzzles;
        this.#examples = examples;
        this.#split = /\r?\n/;

        this.#transform = Day.#defaultTransform;
        this.#postTransform = null;
    }

    setTransform(fn: Transform) {
        this.#transform = fn;
        return this;
    }

    setPostTransform(fn: Nullable<PostTransformFn<T>>) {
        this.#postTransform = fn;
        return this;
    }

    setSplit(s: RegExp | string) {
        this.#split = s;
        return this;
    }

    async solve(part: number = 0, ...args: CtxFromParams<T>) {
        return this.#evaluateParts(this.#puzzles, part, false, ...args);
    }

    async examples(part: number = 0, ...args: CtxFromParams<T>) {
        for (const example of this.#examples) {
            await this.#evaluateParts(example, part, true, ...args);
        }
    }

    async #readInput(path: string, ...args: CtxFromParams<T>) {
        const absPath = pathMod.join(ROOT_PATH, path);
        const buf = await fs.readFile(absPath);
        let transformed = this.#transform(buf, this.#split);
        if (typeof this.#postTransform === "function") {
            transformed = this.#postTransform(transformed, ...args);
        }
        return transformed;
    }

    async #evaluate(
        config: Config<ReturnType<T>>,
        part: number,
        isExample: boolean,
        ...args: CtxFromParams<T>
    ) {
        const p = Day.#getPath(config, isExample);
        const want = Day.#getWant(config);
        const input = await this.#readInput(p, ...args);
        const start = performance.now();
        const result = await this.#fn(
            Day.#makePart(part, isExample),
            input,
            ...args
        );
        const timing = (performance.now() - start).toFixed(3) + "ms";

        let txt = isExample ? `EXAMPLE ${part}` : `PUZZLE  ${part}`;
        let got = result;
        let ctx = "";
        if (result instanceof Result) {
            got = result.data;
            ctx = ` (${result.ctx})`;
        }

        if (got !== want) {
            console.log(
                `${RED}FAIL${RESET} ${txt}: got=${got} want=${want}${ctx}`
            );
        } else {
            console.log(
                `${GREEN}PASS${RESET} ${txt}: ${got} (${timing})${ctx}`
            );
        }
    }

    async #evaluateParts(
        [part1, part2]: DayConfig<ReturnType<T>>,
        part: number,
        isExample: boolean = false,
        ...args: CtxFromParams<T>
    ) {
        if (Day.#isTarget(part, 1)) {
            await this.#evaluate(part1, 1, isExample, ...args);
        }
        if (Day.#isTarget(part, 2)) {
            await this.#evaluate(part2, 2, isExample, ...args);
        }
    }

    static #defaultTransform(s: Buffer, split: RegExp | string) {
        return s.toString().trimEnd().split(split);
    }

    static #isTarget(part: number, n: number) {
        return part === 0 || part === n;
    }

    static #makePart(part: number, isExample: boolean): Part {
        return {one: part === 1, two: part === 2, isExample};
    }

    static #getWant<T>(config: Config<T>) {
        if (Day.#hasKey(config, "want")) return (<ConfigObj<T>>config).want;
        return config;
    }

    static #getPath<T>(config: Config<T>, isExample: boolean) {
        if (Day.#hasKey(config, "path")) return (<ConfigObj<T>>config).path;
        return DEFAULT_PATH[Number(isExample)];
    }

    static #hasKey(obj: unknown, key: PropertyKey) {
        return obj !== null && typeof obj === "object" && key in obj;
    }
}

export default Day;
