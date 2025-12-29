import util from "node:util";

class Printable {
    toString() {
        return "";
    }

    [util.inspect.custom]() {
        return this.toString();
    }
}

export default Printable;
