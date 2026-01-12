import util from "node:util";
import type {Stringable} from "./types";

/**
 * Abstract base class for objects with custom string representations.
 *
 * Provides integration with Node.js's util.inspect for better console output.
 *
 * ```ts
 * class Vec2 extends Printable {
 *   constructor(public x: number, public y: number) {
 *     super();
 *   }
 *
 *   toString() {
 *     return `(${this.x},${this.y})`;
 *   }
 * }
 *
 * const v = new Vec2(3, 4);
 * console.log(v); // Prints: (3,4) instead of Vec2 { x: 3, y: 4 }
 * ```
 */
abstract class Printable implements Stringable {
    /** Should be overridden by subclasses. */
    toString() {
        return "";
    }

    [util.inspect.custom]() {
        return this.toString();
    }
}

export default Printable;
