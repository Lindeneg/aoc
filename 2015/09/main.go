package main

import (
	"fmt"
	"strconv"

	"github.com/lindeneg/aoc/cl"
)

func main() {
	example := cl.NewInput("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 605,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 982,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 251,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 898,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	g := newGraph()
	for _, line := range input.R1 {
		var from, to, weight string
		fmt.Sscanf(line, "%s to %s = %s", &from, &to, &weight)
		w, _ := strconv.Atoi(weight)
		g.addEdge(from, to, w)
		g.addEdge(to, from, w)
	}
	best := 0
	pos := g.newPos()
	for pos != nil {
		current := g.traversePermutations(pos, part2)
		if best == 0 || ((part2 && current > best) || (!part2 && current < best)) {
			best = current
		}
		pos = g.newPos()
	}
	return best
}

type edge struct {
	to     *node
	weight int
}

type node struct {
	name  string
	edges []*edge
}

type graph struct {
	startPositions map[string]bool
	nodes          map[string]*node
}

func newGraph() *graph {
	return &graph{startPositions: map[string]bool{}, nodes: map[string]*node{}}
}

func (g *graph) addNode(name string) *node {
	if n, ok := g.nodes[name]; ok {
		return n
	}
	n := &node{name: name}
	g.nodes[name] = n
	return n
}

func (g *graph) addEdge(from, to string, weight int) {
	fromNode := g.addNode(from)
	toNode := g.addNode(to)
	fromNode.edges = append(fromNode.edges, &edge{to: toNode, weight: weight})
}

func (g *graph) newPos() *node {
	for _, n := range g.nodes {
		if _, ok := g.startPositions[n.name]; !ok {
			g.startPositions[n.name] = true
			return n
		}
	}
	return nil
}

func (g *graph) traversePermutations(start *node, part2 bool) int {
	visited := map[string]bool{}
	visited[start.name] = true
	return g.traverse(start, visited, part2)
}

func (g *graph) traverse(n *node, visited map[string]bool, part2 bool) int {
	if len(visited) == len(g.nodes) {
		return 0
	}
	best := 0
	for _, e := range n.edges {
		if _, ok := visited[e.to.name]; ok {
			continue
		}
		visited[e.to.name] = true
		current := g.traverse(e.to, visited, part2)
		t := e.weight + current
		if best == 0 || ((part2 && t > best) || (!part2 && t < best)) {
			best = e.weight + current
		}
		delete(visited, e.to.name)
	}
	return best
}
