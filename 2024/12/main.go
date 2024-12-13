package main

import (
	"github.com/lindeneg/aoc/cl"
)

var directions = []cl.Vec2{
	cl.V2(1, 0),
	cl.V2(0, 1),
	cl.V2(-1, 0),
	cl.V2(0, -1),
}

func main() {
	example1 := cl.NewInput("example1.in")
	example2 := cl.NewInput("example2.in")
	example3 := cl.NewInput("example3.in")
	example4 := cl.NewInput("example4.in")
	example5 := cl.NewInput("example5.in")
	cl.Example(
		cl.Ex[int]{
			Want: 1930,
			Fn:   func() int { return puzzle(example1, false) },
		},
		cl.Ex[int]{
			Want: 80,
			Fn:   func() int { return puzzle(example2, true) },
		},
		cl.Ex[int]{
			Want: 436,
			Fn:   func() int { return puzzle(example3, true) },
		},
		cl.Ex[int]{
			Want: 236,
			Fn:   func() int { return puzzle(example4, true) },
		},
		cl.Ex[int]{
			Want: 368,
			Fn:   func() int { return puzzle(example5, true) },
		},
		cl.Ex[int]{
			Want: 1206,
			Fn:   func() int { return puzzle(example1, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 1431316,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 821428,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

var visisted map[cl.Vec2]bool

func puzzle(input cl.Input, part2 bool) int {
	visisted = map[cl.Vec2]bool{}
	ans := 0
	for y := 0; y < len(input.R2); y++ {
		for x := 0; x < len(input.R2[y]); x++ {
			p := cl.V2(x, y)
			if visisted[p] {
				continue
			}
			peri, plots := traverse(input.R2, p, input.R2.V(p), 0, []cl.Vec2{})
			if part2 {
				ans += sides(plots) * len(plots)
			} else {
				ans += (peri * len(plots))
			}
		}
	}
	return ans
}

func traverse(R2 cl.R2, pos cl.Vec2, t string, peri int, plots []cl.Vec2) (int, []cl.Vec2) {
	if !R2.ValidIdx(pos) || visisted[pos] {
		return peri, plots
	}
	if R2.V(pos) == t {
		plots = append(plots, pos)
		peri += countPerimeter(R2, pos, t)
		visisted[pos] = true
		for _, d := range directions {
			peri, plots = traverse(R2, pos.Add(d), t, peri, plots)
		}
	}
	return peri, plots
}

func countPerimeter(R2 cl.R2, pos cl.Vec2, t string) int {
	var peri int
	for _, d := range directions {
		np := pos.Add(d)
		if !R2.ValidIdx(np) || R2.V(np) != t {
			peri++
		}
	}
	return peri
}

func sides(plots []cl.Vec2) int {
	valid := map[cl.Vec2]bool{}
	validIdx := func(v cl.Vec2) bool {
		if v, ok := valid[v]; ok {
			return v
		}
		ans := false
		for _, p := range plots {
			if p.Equals(v) {
				ans = true
				break
			}
		}
		valid[v] = ans
		return ans
	}
	ans := 0
	for _, p := range plots {
		upleft := p.UpLeft()
		up := p.Up()
		upright := p.UpRight()
		right := p.Right()
		downright := p.DownRight()
		down := p.Down()
		downleft := p.DownLeft()
		left := p.Left()
		if !validIdx(up) && !validIdx(upright) && !validIdx(right) {
			ans++
		}
		if !validIdx(up) && !validIdx(upleft) && !validIdx(left) {
			ans++
		}
		if !validIdx(down) && !validIdx(downleft) && !validIdx(left) {
			ans++
		}
		if !validIdx(down) && !validIdx(downright) && !validIdx(right) {
			ans++
		}
		if validIdx(up) && validIdx(right) && !validIdx(upright) {
			ans++
		}
		if validIdx(up) && validIdx(left) && !validIdx(upleft) {
			ans++
		}
		if validIdx(down) && validIdx(left) && !validIdx(downleft) {
			ans++
		}
		if validIdx(down) && validIdx(right) && !validIdx(downright) {
			ans++
		}
		if !validIdx(up) && !validIdx(left) && validIdx(upleft) {
			ans++
		}
		if !validIdx(up) && !validIdx(right) && validIdx(upright) {
			ans++
		}
		if !validIdx(down) && !validIdx(left) && validIdx(downleft) {
			ans++
		}
		if !validIdx(down) && !validIdx(right) && validIdx(downright) {
			ans++
		}
	}
	return ans
}
