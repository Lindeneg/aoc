package main

import (
	"github.com/lindeneg/aoc/cl"
)

type A map[cl.Vec2]bool

func main() {
	example := cl.NewInput("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 14,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 34,
			Fn:   func() int { return puzzle(example, true) },
		},
	)

	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 303,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 1045,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	antinodes := make(A, 0)
	for y := 0; y < len(input.R2); y++ {
		for x := 0; x < len(input.R2[y]); x++ {
			c := input.R2[y][x]
			if c != "." {
				solve(input.R2, cl.Vec2{X: x, Y: y}, c, antinodes, part2)
			}
		}
	}
	return len(antinodes)
}

func solve(R2 cl.R2, pos cl.Vec2, antenna string, antinodes A, part2 bool) {
	if !R2.ValidIdx(pos) {
		return
	}
	for y := 0; y < len(R2); y++ {
		for x := 0; x < len(R2[0]); x++ {
			if x == pos.X && y == pos.Y {
				continue
			}
			if R2[y][x] == antenna {
				if part2 {
					findAntinodesP2(R2, pos, cl.Vec2{X: x, Y: y}, antinodes)
				} else {
					findAntinodesP1(R2, pos, cl.Vec2{X: x, Y: y}, antinodes)
				}
			}
		}
	}
}

func findAntinodesP1(R2 cl.R2, origin cl.Vec2, target cl.Vec2, antinodes A) {
	ot := target.Sub(origin)
	originAnode := origin.Add(ot.Scale(-1))
	if R2.ValidIdx(originAnode) {
		antinodes[originAnode] = true
	}
	targetAnode := target.Add(ot)
	if R2.ValidIdx(targetAnode) {
		antinodes[targetAnode] = true
	}
}

func findAntinodesP2(R2 cl.R2, origin cl.Vec2, target cl.Vec2, antinodes A) {
	ab := target.Sub(origin)
	extendLine(R2, origin, ab, antinodes, 1)
	extendLine(R2, origin, ab, antinodes, -1)
	extendLine(R2, target, ab, antinodes, 1)
	extendLine(R2, target, ab, antinodes, -1)
}

func extendLine(
	R2 cl.R2,
	start cl.Vec2,
	direction cl.Vec2,
	antinodes A,
	step int,
) {
	k := 1
	for {
		newPos := start.Add(direction.Scale(k * step))
		if !R2.ValidIdx(newPos) {
			break
		}
		antinodes[newPos] = true
		k++
	}
}
