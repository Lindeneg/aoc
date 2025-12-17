package main

import "github.com/lindeneg/aoc/cl"

func main() {
	example := cl.NewInput("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 42,
			Fn:   func() int { return puzzle(example, false) },
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
	//			Fn:   func() int { return puzzle(input, false) },
	//		},
	//		cl.Ex[int]{
	//			Want: 0,
	//			Fn:   func() int { return puzzle(input, true) },
	//		},
	//	)
}

func puzzle(input cl.Input, _ bool) int {
	return 0
}
