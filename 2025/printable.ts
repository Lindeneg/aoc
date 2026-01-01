import util from "node:util";

abstract class Printable {
    toString() {
        return "";
    }

    [util.inspect.custom]() {
        return this.toString();
    }
}

export default Printable;
