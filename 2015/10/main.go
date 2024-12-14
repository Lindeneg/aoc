package main

import (
	"github.com/lindeneg/aoc/cl"
)

func main() {
	example := cl.NewInputS("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 82350,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 1166642,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInputS("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 329356,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 4666278,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	rounds := 40
	if part2 {
		rounds = 50
	}
	r := input.B
	for i := 0; i < rounds; i++ {
		r = solve(r)
	}
	return len(r)
}

func solve(B []byte) []byte {
	b := []byte{}
	i := 0
	for i < len(B) {
		cur := B[i]
		j := i + 1
		for j < len(B) && B[j] == cur {
			j++
		}
		diff := j - i
		b = append(b, byte(diff+48), cur)
		i += diff
	}
	return b
}
