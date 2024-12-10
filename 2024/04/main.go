package main

import (
	"strings"

	"github.com/lindeneg/aoc/cl"
)

const (
	target1 = "XMAS"
	target2 = "MAS"
	target3 = "SAM"
)

var directions = [8]cl.Vec2{
	cl.V2(1, 1),
	cl.V2(-1, -1),
	cl.V2(1, -1),
	cl.V2(-1, 1),
	cl.V2(1, 0),
	cl.V2(-1, 0),
	cl.V2(0, 1),
	cl.V2(0, -1),
}

func main() {
	example := cl.NewInput("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 18,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 9,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 2573,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 1850,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	ans := 0
	for y := 0; y < len(input.R2); y++ {
		for x := 0; x < len(input.R2[y]); x++ {
			vec := cl.V2(x, y)
			if part2 {
				ans += puzzle2(input.R2, vec)
			} else {
				ans += puzzle1(input.R2, vec)
			}
		}
	}
	return ans
}

func puzzle1(R2 cl.R2, vec cl.Vec2) int {
	checkDirection := func(v cl.Vec2) int {
		for i := 0; i < len(target1); i++ {
			nv := vec.Add(v.Scale(i))
			if !R2.ValidIdx(nv) {
				return 0
			}
			if R2.V(nv) != string(target1[i]) {
				return 0
			}
		}
		return 1
	}
	ans := 0
	for _, dir := range directions {
		ans += checkDirection(dir)
	}
	return ans
}

func puzzle2(R2 cl.R2, vec cl.Vec2) int {
	if R2.V(vec) != "A" {
		return 0
	}
	sb := strings.Builder{}
	for _, dir := range directions[:4] {
		av := vec.Add(dir)
		sv := vec.Sub(dir)
		if !R2.ValidIdx(vec.Add(dir)) || !R2.ValidIdx(vec.Sub(dir)) {
			return 0
		}
		sb.WriteString(R2.V(av))
		sb.WriteString(R2.V(vec))
		sb.WriteString(R2.V(sv))
		s := sb.String()
		if s != target2 && s != target3 {
			return 0
		}
		sb.Reset()
	}
	return 1
}
