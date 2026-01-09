import type {AnyObj, ResultFailure, ResultSuccess} from "./types";

export function success<TData>(data: TData): ResultSuccess<TData> {
    return {data, ok: true};
}

export function failure<TCtx extends AnyObj>(
    msg: string,
    ctx?: TCtx
): ResultFailure<TCtx> {
    return {msg, ctx, ok: false};
}
