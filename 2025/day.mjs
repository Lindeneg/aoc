import fs from "fs/promises";

class TestFail extends Error {
    constructor(p, c, g, e) {
        super(`TEST FAIL: '${p}' part ${c} got: ${g} not ${e}`);
    }
}

export default function (part1Cfg, part2Cfg, ...examples) {
    const answers = {part1: 0, part2: 0};

    let split = "\r\n";
    let once = null;

    let part1 = async function () {};

    let part2 = async function () {};

    let transform = function (s) {
        return s.toString().trimEnd().split(split);
    };

    async function readInput(path) {
        const buf = await fs.readFile(path);
        return transform(buf, split);
    }

    function checkPart1Answer() {
        if (part1Cfg.expected !== null && answers.part1 !== part1Cfg.expected) {
            throw new TestFail(
                part1Cfg.path,
                1,
                answers.part1,
                part1Cfg.expected
            );
        }
    }

    function checkPart2Answer() {
        if (part1Cfg.expected !== null && answers.part2 !== part2Cfg.expected) {
            throw new TestFail(
                part2Cfg.path,
                2,
                answers.part2,
                part2Cfg.expected
            );
        }
    }

    function checkExampleAnswer(path, part, got, expected) {
        if (expected !== null && got !== expected) {
            throw new TestFail(path, part, got, expected);
        }
    }

    function isTarget(part, n) {
        return part === 0 || part === n;
    }

    return {
        answers,

        async run(part = null) {
            answers.part1 = 0;
            answers.part2 = 0;
            if (once) {
                await once(await readInput(part1Cfg.path));
                if (isTarget(1)) checkPart1Answer();
                if (isTarget(2)) checkPart2Answer();
            } else if (part === 1) {
                await part1(await readInput(part1Cfg.path));
                checkPart1Answer();
            } else if (part === 2) {
                await part2(await readInput(part2Cfg.path));
                checkPart2Answer();
            } else {
                const [inp1, inp2] = await Promise.all([
                    readInput(part1Cfg.path),
                    readInput(part2Cfg.path),
                ]);
                await Promise.all([part1(inp1), part2(inp2)]);
                checkPart1Answer();
                checkPart2Answer();
            }
            console.log(answers);
        },

        async examples(part = 0) {
            answers.part1 = 0;
            answers.part2 = 0;
            for (const {path, expected1, expected2} of examples) {
                const input = await readInput(path);
                if (once) {
                    await once(input);
                } else {
                    await Promise.all([part1(input), part2(input)]);
                }

                if (isTarget(part, 1)) {
                    checkExampleAnswer(path, 1, answers.part1, expected1);
                }
                if (isTarget(part, 2)) {
                    checkExampleAnswer(path, 2, answers.part2, expected2);
                }
            }
        },

        setOnce(fn) {
            once = fn;
        },

        setPart1(fn) {
            part1 = fn;
        },

        setPart2(fn) {
            part2 = fn;
        },

        setSplit(s) {
            split = s;
        },

        setTransform(fn) {
            transform = fn;
        },
    };
}
