import type {AnyObj, ErrorResult, Result, ResultSuccess} from "./types";

export function success<TData>(data: TData): ResultSuccess<TData> {
    return {data, ok: true};
}

export function emptySuccess(): ResultSuccess<null> {
    return {data: null, ok: true};
}

export function failure<TCtx extends AnyObj = never>(
    ...[msg, ctx]: [TCtx] extends [never]
        ? [msg: string]
        : [msg: string, ctx: TCtx]
): ErrorResult<TCtx> {
    if (ctx === undefined) return {msg, ok: false} as ErrorResult<TCtx>;
    return {msg, ctx, ok: false} as ErrorResult<TCtx>;
}

export function must<T extends Result<any>>(
    r: T
): [T] extends [Result<infer TData>] ? TData : never {
    if (!r.ok) throw new Error(r.msg);
    return r.data;
}
