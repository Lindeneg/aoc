import type {AnyObj} from "./types";

export type ResultSuccess<TData> = {
    data: TData;
    ok: true;
};

export interface ResultFailure {
    msg: string;
    ok: false;
}

export interface ResultFailureWithCtx<TErrorCtx extends AnyObj>
    extends ResultFailure {
    ctx: TErrorCtx;
}

export type ErrorResult<TErrorCtx extends AnyObj = never> = [
    TErrorCtx,
] extends [never]
    ? ResultFailure
    : ResultFailureWithCtx<TErrorCtx>;

/**
 * Union type representing either a successful or failed operation.
 *
 * - For operations that return void, use `Result` (defaults to Result<null>)
 * - For operations that return data, use `Result<T>`
 * - For operations with error context, use `Result<T, ErrorCtx>`
 *
 * Function returning void
 * ```ts
 * function validateInput(input: string): Result {
 *   if (!input) return failure("input required");
 *   return emptySuccess();
 * }
 * ```
 *
 * Function returning data
 * ```ts
 * function parseNumber(input: string): Result<number> {
 *   const num = Number(input);
 *   if (isNaN(num)) return failure("not a number");
 *   return success(num);
 * }
 * ```
 */
export type Result<TData = null, TErrorCtx extends AnyObj = never> =
    | ResultSuccess<TData>
    | ErrorResult<TErrorCtx>;

/**
 * Creates a successful result containing data.
 *
 * ```ts
 * const result = success(42);
 * console.log(result.data); // 42
 * console.log(result.ok); // true
 * ```
 */
export function success<TData>(data: TData): ResultSuccess<TData> {
    return {data, ok: true};
}

/**
 * Creates a successful result with no return data.
 *
 * ```ts
 * function validateConfig(config: Config): Result {
 *   if (!config.isValid) return failure("invalid config");
 *   return emptySuccess();
 * }
 * ```
 */
export function emptySuccess(): ResultSuccess<null> {
    return {data: null, ok: true};
}

/**
 * Creates a failed result with an error message and optional context.
 *
 * Without context
 * ```ts
 * return failure("file not found");
 * ```
 *
 * With context
 * ```ts
 * return failure("parse error", {line: 42, column: 10});
 * ```
 */
export function failure<TCtx extends AnyObj = never>(
    ...[msg, ctx]: [TCtx] extends [never]
        ? [msg: string]
        : [msg: string, ctx: TCtx]
): ErrorResult<TCtx> {
    if (ctx === undefined) return {msg, ok: false} as ErrorResult<TCtx>;
    return {msg, ctx, ok: false} as ErrorResult<TCtx>;
}

/**
 * Unwraps a Result, returning the data or throwing an error.
 *
 * ```ts
 * const grid = unwrap(Grid2.make([1, 2, 3], 3, 1));
 * // If Grid2.make fails, an exception is thrown
 * // Otherwise, grid is typed as Grid2<number>
 * ```
 */
export function unwrap<T extends Result<any>>(
    r: T
): [T] extends [Result<infer TData>] ? TData : never {
    if (!r.ok) throw new Error(r.msg);
    return r.data;
}
