package main

import (
	"github.com/lindeneg/aoc/cl"
)

const (
	Obstacle = "#"
	Free     = "."
)

var (
	Moves      = [4]cl.Vec2{cl.V2(1, 0), cl.V2(0, 1), cl.V2(-1, 0), cl.V2(0, -1)}
	Directions = [4]string{">", "v", "<", "^"}
)

// 2nd part takes a few seconds.
// TODO: try to actually use your brain

func main() {
	example := cl.NewInput("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 41,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 6,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 4776,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 1586,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	g := newGuard(input)
	if part2 {
		return g.part2()
	}
	for g.forward() {
	}
	return len(g.uniques)
}

type guard struct {
	data     cl.R2
	startPos cl.Vec3
	pos      cl.Vec3
	uniques  map[cl.Vec2]bool
}

func newGuard(input cl.Input) *guard {
	for y := 0; y < len(input.R2); y++ {
		for x := 0; x < len(input.R2[y]); x++ {
			if dir := direction(input.R2[y][x]); dir > -1 {
				v := cl.V3(x, y, dir)
				return &guard{
					pos:      v,
					startPos: v,
					data:     input.R2,
					uniques:  make(map[cl.Vec2]bool),
				}
			}
		}
	}
	panic("no guard found")
}

func (g *guard) forward() bool {
	newPos := cl.Vec3{X: g.pos.X, Y: g.pos.Y, Z: g.pos.Z}
	move := Moves[g.pos.Z]
	newPos.X += move.X
	newPos.Y += move.Y
	if !g.data.ValidIdx(newPos.Vec2()) {
		return false
	}
	if g.data.V(newPos.Vec2()) == Obstacle {
		g.pos.Z = (g.pos.Z + 1) % len(Directions)
		return g.forward()
	}
	g.pos = newPos
	if _, ok := g.uniques[newPos.Vec2()]; !ok {
		g.uniques[newPos.Vec2()] = true
	}
	return true
}

func (g *guard) part2() int {
	matches := 0
	for y := 0; y < len(g.data); y++ {
		for x := 0; x < len(g.data[y]); x++ {
			c := g.data[y][x]
			if c != Free {
				continue
			}
			seen := make(map[cl.Vec3]bool)
			tmp := g.data[y][x]
			g.data[y][x] = Obstacle
			if g.simulate(seen) {
				matches++
			}
			g.data[y][x] = tmp
			g.pos = g.startPos.Copy()
		}
	}
	return matches
}

func (g *guard) simulate(seen map[cl.Vec3]bool) bool {
	for g.forward() {
		if _, ok := seen[g.pos]; ok {
			return true
		}
		seen[g.pos] = true
	}
	return false
}

func direction(s string) int {
	for i, v := range Directions {
		if s == v {
			return i
		}
	}
	return -1
}
