import util from "node:util";
import type {Stringable} from "./types";

abstract class Printable implements Stringable {
    toString() {
        return "";
    }

    [util.inspect.custom]() {
        return this.toString();
    }
}

export default Printable;
