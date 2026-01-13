import {performance} from "node:perf_hooks";
import fs from "fs/promises";
import pathMod from "path";
import Printable from "./printable";
import {hasKey} from "./common";
import {success, failure, type Result} from "./result";
import type {Nullable, AnyFn} from "./types";

/** Part indicator for puzzle solutions. */
export type Part = Record<"one" | "two" | "isExample", boolean>;

/** Configuration with custom input file path */
type ConfigObj<T> = {path: string; want: T};

/** Configuration allowing either just the expected answer or a custom path */
type Config<T> = Nullable<ConfigObj<T> | T>;

/** Configuration for both parts of a day's puzzle */
type DayConfig<T> = [Config<T>, Config<T>];

/** Extracts additional context arguments from solve function parameters */
type CtxFromParams<T extends AnyFn> = Parameters<T> extends [
    any,
    any,
    ...infer Rest,
]
    ? Rest
    : never;

/** Extracts the data type from solve function parameters */
type DataFromParams<T extends AnyFn> = Parameters<T>[1];

/** Solve function signature. */
type SolveFn<TData = any, TReturn = any, TArgs extends Array<any> = any> = (
    part: Part,
    data: TData,
    ...args: TArgs
) => TReturn;

/** Transform function for raw buffer to string array */
type Transform = (s: Buffer, split: RegExp | string, part: Part) => string[];

/**
 * Post-transform function for further parsing after splitting. This is useful
 * if you want the default transform but then also want to do some additional operations.
 * */
type PostTransform<TVal, TArgs extends Array<any>> = (
    s: string[],
    part: Part,
    ...args: TArgs
) => TVal;

/** Type-safe post-transform function extracted from solve function */
type PostTransformFn<T extends AnyFn> = PostTransform<
    DataFromParams<T>,
    CtxFromParams<T>
>;

/** Complete result information for a single puzzle part */
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

/**
 * Result of running a puzzle part.
 * Contains full result info in both success and failure cases.
 */
type SolveResult<T> = Result<
    // Success state (answer matched expected)
    SolveResultObj<T>,
    // Failure state (answer didn't match or other error)
    SolveResultObj<T>
>;

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

/**
 * Extract year and day from command-line arguments
 * TODO: Consider alternative approach or add validation
 * */
const ROOT_PATH = process.argv[2] as string;
const [YEAR, DAY] = ROOT_PATH.split("/")
    .slice(-2)
    .map((e) => +e);

/**
 * Default input file paths (created by `aoc` script)
 * Can be overridden per-solve using DayConfig type
 * */
const DEFAULT_PATH = ["puzzle.in", "example.in"] as const;

/** Container for multiple SolveResults providing clean stringified output. */
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

/**
 * Handles AoC input file reading, parsing, test execution, and result validation.
 *
 * Basic usage
 * ```ts
 * const day1 = new Day(
 *   (part, lines: string[]) => {
 *     let answer = 0;
 *     for (const line of lines) {
 *       const num = parseInt(line);
 *       if (part.one) answer += num;
 *       if (part.two) answer += num * 2;
 *     }
 *     return answer;
 *   },
 *   // puzzles:  [part1, part2]
 *   [100, {path: "/some/path", want: 200}],
 *   // examples: [part1, part2]
 *   [10, 20]
 * );
 *
 * (async () => {
 *   console.log(await day1.examples());
 *   console.log(await day1.solve());
 * })();
 * ```
 *
 * With custom parsing
 * ```ts
 * const day2 = new Day(
 *   (part, grids: Grid2<number>[]) => {
 *     // Work with parsed Grid2 objects
 *     return grids.length;
 *   },
 *   [42, 84]
 * ).setPostTransform((lines) => {
 *   // Parse lines into Grid2 objects
 *   return lines.map(line =>
 *     unwrap(Grid2.fromNested(line.split('').map(c => [Number(c)])))
 *   );
 * });
 * ```
 *
 * With additional arguments
 * ```ts
 * const day3 = new Day(
 *   (part, lines: string[], threshold: number) => {
 *     return lines.filter(l => l.length > threshold).length;
 *   },
 *   [5, 10]
 * );
 *
 * await day3.solve(0, 3);  // Run both parts with threshold=3
 * await day3.solve(1, 5);  // Run only part 1 with threshold=5
 * ```
 */
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
        this.#split = /\r?\n/; // Default: split on newlines

        this.#transform = Day.#defaultTransform;
        this.#postTransform = null;
        this.#ctx = null;
    }

    /** Sets custom buffer transformation (before splitting). */
    setTransform(fn: Transform) {
        this.#transform = fn;
        return this;
    }

    /** Sets custom parsing after line splitting. */
    setPostTransform(fn: Nullable<PostTransformFn<T>>) {
        this.#postTransform = fn;
        return this;
    }

    /** Sets custom line splitting pattern used by default transform. */
    setSplit(s: RegExp | string) {
        this.#split = s;
        return this;
    }

    /** Sets custom context string for result display. */
    setCtx(s: Nullable<string>) {
        this.#ctx = s;
        return this;
    }

    /**
     * Runs the solution against puzzle input.
     *
     * ```ts
     * console.log(await day.solve());      // Run both parts
     * console.log(await day.solve(1));     // Run only part 1
     * console.log(await day.solve(0, 42)); // Both parts with arg=42
     * ```
     */
    async solve(
        part: number = 0,
        ...args: CtxFromParams<T>
    ): Promise<SolveResults<ReturnType<T>>> {
        return new SolveResults(
            await this.#evaluateParts(this.#puzzles, part, false, ...args)
        );
    }

    /**
     * Runs the solution against example inputs.
     *
     * ```ts
     * console.log(await day.examples());   // Run all examples, both parts
     * console.log(await day.examples(1));  // Run all examples, part 1 only
     * ```
     */
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
