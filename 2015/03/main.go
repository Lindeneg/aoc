package main

import (
	"github.com/lindeneg/aoc/cl"
)

var Directions = map[byte]cl.Vec2{
	'^': cl.V2(0, 1),
	'v': cl.V2(0, -1),
	'>': cl.V2(1, 0),
	'<': cl.V2(-1, 0),
}

func main() {
	example := cl.NewInputS("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 2,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 11,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 2081,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 2341,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	pos := cl.V2(0, 0)
	posAlt := cl.V2(0, 0)
	visited := map[cl.Vec2]bool{pos: true}
	ans := 1
	for i, v := range input.B {
		var p cl.Vec2
		if i%2 > 0 && part2 {
			posAlt = posAlt.Add(Directions[v])
			p = posAlt
		} else {
			pos = pos.Add(Directions[v])
			p = pos
		}
		if !visited[p] {
			visited[p] = true
			ans++
		}
	}
	return ans
}
