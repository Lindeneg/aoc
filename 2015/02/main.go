package main

import (
	"fmt"

	"github.com/lindeneg/aoc/cl"
)

func main() {
	example := cl.NewInput("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 101,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 48,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 1588178,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 3783758,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	ans := 0
	for _, v := range input.R1 {
		var l, w, h int
		fmt.Sscanf(v, "%dx%dx%d", &l, &w, &h)
		if part2 {
			ans += totalRibbon(l, w, h)
		} else {
			ans += totalWrappingPaper(l, w, h)
		}
	}
	return ans
}

func totalWrappingPaper(l, w, h int) int {
	return 2*l*w + 2*w*h + 2*h*l + min(l*w, w*h, h*l)
}

func totalRibbon(l, w, h int) int {
	return 2*min(l+w, w+h, h+l) + l*w*h
}
