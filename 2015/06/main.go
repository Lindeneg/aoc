package main

import (
	"fmt"
	"strings"

	"github.com/lindeneg/aoc/cl"
)

const (
	TurnOn = iota
	TurnOff
	Toggle
)

var ops = []string{"turn on", "turn off", "toggle"}

func main() {
	example := cl.NewInput("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 998996,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 1001996,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 569999,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 17836115,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	g := makeGrid(1000, 1000, part2)
	for _, v := range input.R1 {
		g.apply(parseOp(v))
	}
	return g.count
}

type grid struct {
	grid  [][]int
	count int
	part2 bool
}

func makeGrid(rows, cols int, part2 bool) *grid {
	g := make([][]int, rows)
	for i := range g {
		g[i] = make([]int, cols)
	}
	return &grid{grid: g, part2: part2}
}

func (g *grid) on(v cl.Vec2) {
	p := g.grid[v.Y][v.X]
	if g.part2 {
		g.grid[v.Y][v.X]++
		g.count++
		return
	}
	g.grid[v.Y][v.X] = 1
	if p == 0 {
		g.count++
	}
}
func (g *grid) off(v cl.Vec2) {
	p := g.grid[v.Y][v.X]
	if g.part2 {
		if p > 0 {
			g.grid[v.Y][v.X]--
			g.count--
		}
		return
	}
	g.grid[v.Y][v.X] = 0
	if p == 1 {
		g.count--
	}
}
func (g *grid) toggle(v cl.Vec2) {
	p := g.grid[v.Y][v.X]
	if g.part2 {
		g.grid[v.Y][v.X] += 2
		g.count += 2
		return
	}
	if p == 1 {
		g.grid[v.Y][v.X] = 0
		g.count--
	} else {
		g.grid[v.Y][v.X] = 1
		g.count++
	}
}

func (g *grid) apply(op Op) {
	for y := op.from.Y; y <= op.to.Y; y++ {
		for x := op.from.X; x <= op.to.X; x++ {
			switch op.op {
			case TurnOn:
				g.on(cl.V2(x, y))
			case TurnOff:
				g.off(cl.V2(x, y))
			case Toggle:
				g.toggle(cl.V2(x, y))
			}
		}
	}
}

type Op struct {
	from, to cl.Vec2
	op       int
}

func parseOp(s string) Op {
	var o Op
	for i, op := range ops {
		if strings.HasPrefix(s, op) {
			s = strings.TrimSpace(strings.TrimPrefix(s, op))
			o.op = i
			break
		}
	}
	fmt.Sscanf(s, "%d,%d through %d,%d", &o.from.X, &o.from.Y, &o.to.X, &o.to.Y)
	return o
}
