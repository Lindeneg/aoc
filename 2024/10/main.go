package main

import (
	"github.com/lindeneg/aoc/cl"
)

const (
	Trailhead = 0
	Trailtail = 9
)

const (
	Unexplored int = iota
	Explored
)

var Directions = [4]cl.Vec2{cl.V2(1, 0), cl.V2(0, 1), cl.V2(-1, 0), cl.V2(0, -1)}

func main() {
	example := cl.NewInputI("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 36,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 81,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInputI("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 816,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 1960,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	var countMap = map[cl.Vec2]int{}
	for y := 0; y < len(input.I2); y++ {
		for x := 0; x < len(input.I2[y]); x++ {
			pos := cl.V2(x, y)
			if input.I2.V(pos) == Trailtail {
				solve(input.I2, pos, countMap, part2)
			}
		}
	}
	ans := 0
	for _, v := range countMap {
		ans += v
	}
	return ans
}

type queue struct {
	q []cl.Vec2
}

func (q *queue) push(v cl.Vec2) {
	q.q = append(q.q, v)
}

func (q *queue) pop() cl.Vec2 {
	v := q.q[0]
	q.q = q.q[1:]
	return v
}

func (q *queue) empty() bool {
	return len(q.q) == 0
}

func solve(I2 cl.I2, pos cl.Vec2, countMap map[cl.Vec2]int, part2 bool) {
	q := queue{}
	explored := map[cl.Vec2]bool{}
	q.push(pos)
	for !q.empty() {
		v := q.pop()
		if I2.V(v) == Trailhead {
			countMap[v]++
			continue
		}
		for _, d := range Directions {
			nv := v.Add(d)
			if !I2.ValidIdx(nv) || (!part2 && explored[nv]) {
				continue
			}
			if I2.V(nv) == I2.V(v)-1 {
				explored[nv] = true
				q.push(nv)
			}
		}
	}
}
