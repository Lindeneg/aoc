package main

import (
	"github.com/lindeneg/aoc/cl"
)

const (
	Up   = 1
	Down = -1
)

var moves = map[byte]int{
	'(': Up,
	')': Down,
}

func main() {
	example := cl.NewInputS("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: -1,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 5,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 280,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 1797,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	ans := 0
	for i, v := range input.B {
		ans += moves[v]
		if ans == Down && part2 {
			return i + 1
		}
	}
	return ans
}
