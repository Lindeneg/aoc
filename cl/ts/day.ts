import {performance} from "node:perf_hooks";
import fs from "fs/promises";
import pathMod from "path";
import Printable from "./printable";
import {hasKey} from "./common";
import {success, failure, type Result} from "./result";
import type {Nullable, AnyFn} from "./types";

type Part = Record<"one" | "two" | "isExample", boolean>;

type ConfigObj<T> = {path: string; want: T};
type Config<T> = Nullable<ConfigObj<T> | T>;
type DayConfig<T> = [Config<T>, Config<T>];

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

type Transform = (s: Buffer, split: RegExp | string, part: Part) => string[];
type PostTransform<TVal, TArgs extends Array<any>> = (
    s: string[],
    part: Part,
    ...args: TArgs
) => TVal;

type PostTransformFn<T extends AnyFn> = PostTransform<
    DataFromParams<T>,
    CtxFromParams<T>
>;

type SolveResultObj<T> = {
    year: number;
    day: number;
    timing: number;
    path: string;
    ctx: string;
    part: Part;
    got: T;
    want: T;
};

// regardless of success state,
// SolveResult always contains
// a full object, as we have the
// same information available in either case
type SolveResult<T> = Result<
    // succcess state
    SolveResultObj<T>,
    // failure state
    SolveResultObj<T>
>;

class SolveResults<T> extends Printable {
    readonly #results: SolveResult<T>[];

    constructor(results: SolveResult<T>[]) {
        super();
        this.#results = results;
    }

    get results(): readonly SolveResult<T>[] {
        return this.#results;
    }

    toString(): string {
        let s = "";
        for (let i = 0; i < this.#results.length; i++) {
            const result = this.#results[i];
            let msg = "";
            if (result.ok) {
                msg = `${GREEN}PASS${RESET} ${this.#makePartTxt(
                    result.data.part
                )}: ${result.data.got} (${
                    result.data.timing.toFixed(3) + "ms"
                })${result.data.ctx}`;
            } else {
                msg = `${RED}FAIL${RESET} ${this.#makePartTxt(
                    result.ctx.part
                )}: got=${result.ctx.got} want=${result.ctx.want}${
                    result.ctx.ctx
                }`;
            }
            s += msg;
            if (i < this.#results.length - 1) {
                s += "\n";
            }
        }
        return s;
    }

    #makePartTxt(part: Part) {
        const partNum = part.one ? 1 : 2;
        return part.isExample ? `EXAMPLE ${partNum}` : `PUZZLE  ${partNum}`;
    }
}

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

// TODO maybe get this another way
// or use it as it is but do validation
const ROOT_PATH = process.argv[2] as string;
const [YEAR, DAY] = ROOT_PATH.split("/")
    .slice(-2)
    .map((e) => +e);

// when `aoc` script is used, these paths are always created
// by default, however consumer can provide custom paths
// on a per-solve basis by using the DayConfig type.
const DEFAULT_PATH = ["puzzle.in", "example.in"] as const;

class Day<T extends SolveFn> {
    #fn: T;
    #puzzles: DayConfig<ReturnType<T>>;
    #examples: DayConfig<ReturnType<T>>[];
    #split: RegExp | string;
    #transform: Transform;
    #postTransform: Nullable<PostTransformFn<T>>;
    #ctx: Nullable<string>;

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
        this.#ctx = null;
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

    setCtx(s: Nullable<string>) {
        this.#ctx = s;
        return this;
    }

    async solve(
        part: number = 0,
        ...args: CtxFromParams<T>
    ): Promise<SolveResults<ReturnType<T>>> {
        return new SolveResults(
            await this.#evaluateParts(this.#puzzles, part, false, ...args)
        );
    }

    async examples(
        part: number = 0,
        ...args: CtxFromParams<T>
    ): Promise<SolveResults<ReturnType<T>>> {
        const results: SolveResult<ReturnType<T>>[] = [];
        for (const example of this.#examples) {
            const evalResult = await this.#evaluateParts(
                example,
                part,
                true,
                ...args
            );
            results.push(...evalResult);
        }
        return new SolveResults(results);
    }

    async #evaluateParts(
        [part1, part2]: DayConfig<ReturnType<T>>,
        part: number,
        isExample: boolean = false,
        ...args: CtxFromParams<T>
    ): Promise<SolveResult<ReturnType<T>>[]> {
        const results: SolveResult<ReturnType<T>>[] = [];
        if (Day.#isTarget(part, 1)) {
            results.push(await this.#evaluate(part1, 1, isExample, ...args));
        }
        if (Day.#isTarget(part, 2)) {
            results.push(await this.#evaluate(part2, 2, isExample, ...args));
        }
        return results;
    }

    async #evaluate(
        config: Config<ReturnType<T>>,
        part: number,
        isExample: boolean,
        ...args: CtxFromParams<T>
    ): Promise<SolveResult<ReturnType<T>>> {
        const solved: SolveResultObj<any> = {
            year: YEAR,
            day: DAY,
            timing: 0,
            path: Day.#getPath(config, isExample),
            ctx: this.#ctx ? ` (${this.#ctx})` : "",
            part: Day.#makePart(part, isExample),
            got: undefined,
            want: Day.#getWant(config),
        };

        const inputResult = await this.#readInput(
            solved.path,
            solved.part,
            ...args
        );
        if (!inputResult.ok) {
            solved.ctx = ` (${inputResult.msg})`;
            return failure("failed to read input", solved);
        }
        const input = inputResult.data;

        const start = performance.now();
        try {
            solved.got = await this.#fn(solved.part, input, ...args);
            solved.timing = performance.now() - start;
        } catch (err) {
            return failure("DAY: solve function threw exception", solved);
        }

        if (solved.got !== solved.want) {
            return failure("DAY: solve returned unexpected value", solved);
        }

        return success(solved);
    }

    async #readInput(
        path: string,
        part: Part,
        ...args: CtxFromParams<T>
    ): Promise<Result<string[]>> {
        try {
            const absPath = pathMod.join(ROOT_PATH, path);
            const buf = await fs.readFile(absPath);
            let transformed = this.#transform(buf, this.#split, part);
            if (typeof this.#postTransform === "function") {
                transformed = this.#postTransform(transformed, part, ...args);
            }
            return success(transformed);
        } catch (e) {
            return failure(`${e}`);
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
        if (hasKey(config, "want")) return (<ConfigObj<T>>config).want;
        return config;
    }

    static #getPath<T>(config: Config<T>, isExample: boolean) {
        if (hasKey(config, "path")) return (<ConfigObj<T>>config).path;
        return DEFAULT_PATH[Number(isExample)];
    }
}

export default Day;
