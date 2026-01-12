export type AnyFn = (...args: any) => any;

export type AnyObj = Record<PropertyKey, unknown>;

export type Nullable<T> = T | null;

export interface Stringable {
    toString(): string;
}

export interface Comparable<T> {
    equals(a: T): boolean;
}

export interface Copyable<T> {
    copy(): T;
}

export interface Point2<T = any>
    extends Comparable<Point2<T>>,
        Copyable<Point2<T>> {
    x: number;
    y: number;
}

export interface Point3<T = any>
    extends Comparable<Point3<T>>,
        Copyable<Point3<T>> {
    x: number;
    y: number;
    z: number;
}

export type Point<T = any> = Point2<T> | Point3<T>;

export type Coordinates2 = [x: number, y: number];

export type Coordinates3 = [x: number, y: number, z: number];

/** Type helper for abstract or concrete constructors. */
export type Ctor<C extends abstract new (...args: any) => any> = C;

/** Type helper for concrete class constructors. */
export type Class<T> = new (...args: any) => T;
