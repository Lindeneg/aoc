import util from "node:util";

export interface Stringable {
    toString(): string;
}

abstract class Printable implements Stringable {
    toString() {
        return "";
    }

    [util.inspect.custom]() {
        return this.toString();
    }
}

export default Printable;
