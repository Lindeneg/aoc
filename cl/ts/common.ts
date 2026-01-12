/**
 * Key existence check for objects.
 *
 * ```ts
 * const config = {timeout: 5000};
 *
 * if (hasKey(config, "timeout")) {
 *   console.log(config.timeout); // Safe access
 * }
 *
 * hasKey(null, "key"); // false
 * hasKey(42, "key"); // false
 * hasKey({a: 1}, "a"); // true
 * ```
 */
export function hasKey(obj: unknown, key: PropertyKey): boolean {
    return obj !== null && typeof obj === "object" && key in obj;
}

/**
 * Helper to return `.message` when `e` is an `Error`.
 * Otherwise returns `String(e)`
 * */
export function errToStr(e: unknown): string {
    return e instanceof Error ? e.message : String(e);
}
