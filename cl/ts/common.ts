export function hasKey(obj: unknown, key: PropertyKey): boolean {
    return obj !== null && typeof obj === "object" && key in obj;
}
