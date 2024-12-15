package main

import (
	"fmt"
	"strings"

	"github.com/lindeneg/aoc/cl"
)

func main() {
	example := cl.NewInput("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 330,
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
	g := newG(input.R1)

	seen := make(map[string]bool)
	started := "Alice"
	cur := "Alice"
	seen[cur] = true
	limit := cl.Factorial(len(g))
	tries := 0
	best := 0
	val := 0
	for tries < limit {
		if len(seen) == len(g) {
			val += g[cur][started] + g[started][cur]
			if val > best {
				best = val
			}
			val = 0
			seen = make(map[string]bool)
			tries++
			started = cur
			seen[cur] = true
			fmt.Printf("NEW TRY\n\n")
		}
		if tries >= limit {
			break
		}
		for k, v := range g[cur] {
			if !seen[k] {
				fmt.Println(cur, "NEXT TO", k, tries)
				val += v
				seen[k] = true
				cur = k
				break
			}
		}
	}
	return best
}

type G map[string]map[string]int

func newG(R1 []string) G {
	g := make(G)
	for _, line := range R1 {
		line = strings.TrimSuffix(line, ".")
		var (
			from, to string
			weight   int
		)
		if strings.Contains(line, "lose") {
			fmt.Sscanf(line, "%s would lose %d happiness units by sitting next to %s.", &from, &weight, &to)
			weight = -weight
		} else {
			fmt.Sscanf(line, "%s would gain %d happiness units by sitting next to %s.", &from, &weight, &to)
		}
		if _, ok := g[from]; !ok {
			g[from] = make(map[string]int)
		}
		g[from][to] = weight
	}
	return g
}
