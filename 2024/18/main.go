package main

import (
	"fmt"
	"strings"

	"github.com/lindeneg/aoc/cl"
)

var directions = []cl.Vec2{
	cl.V2(0, 1), cl.V2(1, 0),
	cl.V2(0, -1), cl.V2(-1, 0),
}

func main() {
	example := cl.NewInputD("example.in")
	cl.ExpectRun(
		"Example",
		1,
		cl.Ex[int]{
			Want: 22,
			Fn:   func() int { return part1(example) },
		},
	)
	cl.ExpectRun(
		"Example",
		2,
		cl.Ex[cl.Vec2]{
			Want: cl.V2(6, 1),
			Fn:   func() cl.Vec2 { return part2(example) },
		},
	)
	input := cl.NewInputD("puzzle.in")
	cl.ExpectRun(
		"Puzzle",
		1,
		cl.Ex[int]{
			Want: 446,
			Fn:   func() int { return part1(input) },
		},
	)
	cl.ExpectRun(
		"Puzzle",
		2,
		cl.Ex[cl.Vec2]{
			Want: cl.V2(39, 40),
			Fn:   func() cl.Vec2 { return part2(input) },
		},
	)
}

func part1(input cl.Input) int {
	var size int
	var limit int
	fmt.Sscanf(input.R1[0], "%d,%d", &size, &limit)

	lines := strings.Split(input.R1[1], "\n")
	cl.Assert(len(lines) >= limit)

	g := NewGrid(size, limit, lines).FallByte()

	start := cl.V2(0, 0)
	end := cl.V2(size-1, size-1)

	return len(cl.Djikstra(g, start, end))
}

func part2(input cl.Input) cl.Vec2 {
	var size int
	var limit int
	fmt.Sscanf(input.R1[0], "%d,%d", &size, &limit)

	lines := strings.Split(input.R1[1], "\n")
	cl.Assert(len(lines) >= limit)

	g := NewGrid(size, limit, lines).FallByte()

	start := cl.V2(0, 0)
	end := cl.V2(size-1, size-1)

	// TODO try and be a bit smarter
	for len(cl.Djikstra(g, start, end)) > 0 {
		g.limit++
		g.FallByte()
	}
	return g.lastObstacle

}

type grid struct {
	g            cl.B2
	size         int
	limit        int
	lines        []string
	lastObstacle cl.Vec2
	obstacles    map[cl.Vec2]bool
}

func NewGrid(size int, limit int, lines []string) *grid {
	g := make(cl.B2, size)
	for i := range g {
		g[i] = make([]byte, size)
	}
	return &grid{
		g:         g,
		size:      size,
		limit:     limit,
		lines:     lines,
		obstacles: make(map[cl.Vec2]bool),
	}
}

func (g *grid) Edges(v cl.Vec2) []cl.Vec2 {
	return directions
}

func (g *grid) Obstacle(v cl.Vec2) bool {
	return g.obstacles[v]
}

func (g *grid) ValidIdx(v cl.Vec2) bool {
	return g.g.ValidIdx(v)
}

func (g *grid) FallByte() *grid {
	i := len(g.obstacles)
	cl.Assert(i < g.limit)
	for i < g.limit {
		var v cl.Vec2
		fmt.Sscanf(g.lines[i], "%d,%d", &v.X, &v.Y)
		g.obstacles[v] = true
		g.lastObstacle = v
		i++
	}
	return g
}
