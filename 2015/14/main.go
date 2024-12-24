package main

import (
	"fmt"

	"github.com/lindeneg/aoc/cl"
)

func main() {
	example := cl.NewInput("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 1120,
			Fn:   func() int { return puzzle(example, 1000, false) },
		},
		//		cl.Ex[int]{
		//			Want: 42,
		//			Fn:   func() int { return puzzle(example, true) },
		//		},
	)
	//	input := cl.NewInput("puzzle.in")
	//	cl.Puzzle(
	//		cl.Ex[int]{
	//			Want: 0,
	//			Fn:   func() int { return puzzle(input, 2503, false) },
	//		},
	//		cl.Ex[int]{
	//			Want: 0,
	//			Fn:   func() int { return puzzle(input, true) },
	//		},
	//	)
}

func puzzle(input cl.Input, seconds int, _ bool) int {
	return 0
}

type reindeer struct {
	speed, fly, rest int
}

func newReindeer(s string) *reindeer {
	var speed, fly, rest int
	fmt.Sscanf(s,
		"%d km/s can fly %d seconds, but then must rest for %d seconds.", &speed, &fly, &rest)
	return &reindeer{speed, fly, rest}
}
