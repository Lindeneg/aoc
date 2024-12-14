package main

import (
	"fmt"
	"strings"

	"github.com/lindeneg/aoc/cl"
)

var (
	P2Adder = cl.V2(10000000000000, 10000000000000)
)

func main() {
	example := cl.NewInputD("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 480,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 875318608908,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInputD("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 35997,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 82510994362072,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	ans := 0
	for _, v := range input.R1 {
		ans += parseMachine(v, part2)
	}
	return ans
}

func parseMachine(v string, part2 bool) int {
	lines := strings.Split(v, "\n")
	a := cl.Vec2{}
	fmt.Sscanf(lines[0], "Button A: X+%d, Y+%d", &a.X, &a.Y)
	b := cl.Vec2{}
	fmt.Sscanf(lines[1], "Button B: X+%d, Y+%d", &b.X, &b.Y)
	p := cl.Vec2{}
	fmt.Sscanf(lines[2], "Prize: X=%d, Y=%d", &p.X, &p.Y)
	if part2 {
		return solve(a, b, p.Add(P2Adder))
	}
	return solve(a, b, p)
}

func solve(a, b, p cl.Vec2) int {
	if (a.X*b.Y)-(b.X*a.Y) == 0 {
		return 0
	}
	eq1 := cl.V3(a.X, b.X, p.X)
	eq2 := cl.V3(a.Y, b.Y, p.Y)
	elim := eq1.Scale(b.Y).Sub(eq2.Scale(b.X))
	A := elim.Z / elim.X
	B := (eq1.Z - (eq1.X * A)) / eq1.Y
	if !cl.V2((a.X*A)+(b.X*B), (a.Y*A)+(b.Y*B)).Equals(p) {
		return 0
	}
	return (A * 3) + B
}
