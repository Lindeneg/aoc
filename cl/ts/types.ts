export type AnyFn = (...args: any) => any;

export type Nullable<T> = T | null;

export interface Point2 {
    x: number;
    y: number;
}

export interface Point3 {
    x: number;
    y: number;
    z: number;
}

export interface Compressor<T extends Point2 | Point3> {
    compress(v: T): T;
    decompress(v: T): T;
}
