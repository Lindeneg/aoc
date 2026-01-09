export type AnyFn = (...args: any) => any;

export interface Stringable {
    toString(): string;
}

export type Nullable<T> = T | null;

export interface Comparable<T> {
    equals(a: T): boolean;
}

export interface Point2<T = any> extends Comparable<T> {
    x: number;
    y: number;
}

export interface Point3<T = any> extends Comparable<T> {
    x: number;
    y: number;
    z: number;
}

export type Point<T = any> = Point2<T> | Point3<T>;

export interface Positionable<T extends Point> {
    readonly pos: T;
}

export interface Compressible<T extends Point> {
    compress(v: T): T;
    decompress(v: T): T;
}

export type AnyObj = Record<PropertyKey, unknown>;

export type Ctor<C extends abstract new (...args: any) => any> = C;

export type Class<T> = new (...args: any) => T;
