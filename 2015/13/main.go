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
		cl.Ex[int]{
			Want: 286,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(

		cl.Ex[int]{
			Want: 709,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 668,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	g := makeParticipants(input.R1, part2)
	totalBest := 0
	for current := range g {
		seated := map[string]bool{}
		seats := []string{current}
		seated[current] = true
		happiness := 0
		for len(seated) < len(g) {
			scoreMap := g[current]
			best := 0
			bestName := ""
			for name, score := range scoreMap {
				if seated[name] {
					continue
				}
				score += g[name][current]
				if best == 0 || score > best {
					best = score
					bestName = name
				}
			}
			if bestName == "" {
				break
			}
			seated[bestName] = true
			seats = append(seats, bestName)
			current = bestName
			happiness += best
		}
		start, last := seats[0], seats[len(seats)-1]
		happiness += (g[start][last] + g[last][start])
		if totalBest == 0 || happiness > totalBest {
			totalBest = happiness
		}
	}
	return totalBest
}

type Participants map[string]map[string]int

func makeParticipants(R1 []string, part2 bool) Participants {
	miles := "Miles"
	g := make(Participants)
	if part2 {
		g[miles] = make(map[string]int)
	}
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
		if part2 {
			g[from][miles] = 0
			g[miles][from] = 0
		}
	}
	return g
}
