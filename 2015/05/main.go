package main

import (
	"regexp"
	"strings"

	"github.com/lindeneg/aoc/cl"
)

var (
	vowels = regexp.MustCompile(`[aeiou]`)
	ignore = map[string]bool{
		"ab": true,
		"cd": true,
		"pq": true,
		"xy": true,
	}
)

func main() {
	example1 := cl.NewInput("example1.in")
	example2 := cl.NewInput("example2.in")
	cl.Example(
		cl.Ex[int]{
			Want: 2,
			Fn:   func() int { return puzzle(example1, false) },
		},
		cl.Ex[int]{
			Want: 2,
			Fn:   func() int { return puzzle(example2, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 258,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 53,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	if part2 {
		return puzzle2(input.R1)
	}
	return puzzle1(input.R1)
}

func puzzle1(R1 []string) int {
	ans := 0
Outer:
	for _, v := range R1 {
		if len(v) < 3 {
			continue
		}
		vs := 0
		twice := false
		for i := 0; i < len(v); i++ {
			if i < len(v)-1 && ignore[v[i:i+2]] {
				continue Outer
			}
			if i > 0 && v[i] == v[i-1] {
				twice = true
			}
			if vowels.MatchString(string(v[i])) {
				vs++
			}
		}
		if vs >= 3 && twice {
			ans++
		}
	}
	return ans
}

func puzzle2(R1 []string) int {
	ans := 0
	for _, v := range R1 {
		s := 0
		for i := 0; i < len(v)-1; i++ {
			pair := v[i : i+2]
			if strings.Contains(v[i+2:], pair) {
				s++
				break
			}
		}
		for i := 0; i < len(v)-2; i++ {
			if v[i] == v[i+2] {
				s++
				break
			}
		}
		if s > 1 {
			ans++
		}
	}
	return ans
}
