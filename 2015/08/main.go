package main

import (
	"github.com/lindeneg/aoc/cl"
)

const (
	QUOTE     = 34
	BACKSLASH = 92
	X         = 120
)

func main() {
	example := cl.NewInput("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 12,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 19,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 1371,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 2117,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	chars := 0
	actual := 0
	encoded := 0
	for _, v := range input.R1 {
		actual += len(v)
		encoded += len(v) + 4
		for j := 0; j < len(v)-1; j++ {
			vv := v[j]
			if vv == QUOTE {
				continue
			}
			if vv == BACKSLASH {
				if expectAnyOf(v, j, BACKSLASH, QUOTE) {
					j += 1
					chars++
					encoded += 2
					continue
				} else if expectExact(v, j, X) {
					j += 3
					chars++
					encoded++
					continue
				}
			}
			chars++
		}
	}
	if part2 {
		return encoded - actual
	}
	return actual - chars
}

func expectExact(s string, i int, expected byte) bool {
	return expectAnyOf(s, i, expected)
}

func expectAnyOf(s string, i int, expected ...byte) bool {
	ii := i + 1
	if ii >= len(s) {
		return false
	}
	for _, v := range expected {
		if s[ii] == v {
			return true
		}
	}
	return false
}
