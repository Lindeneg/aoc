package main

import (
	"slices"
	"strings"

	"github.com/lindeneg/aoc/cl"
)

func main() {
	example := cl.NewInput("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 11,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 31,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 1388114,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 23529853,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	left, right := LeftRightInts(input.R1)
	if part2 {
		return puzzle2(left, right)
	}
	return puzzle1(left, right)
}

func puzzle1(left []int, right []int) int {
	slices.Sort(left)
	slices.Sort(right)
	ans := 0
	for i := 0; i < len(left); i++ {
		ans += cl.AbsInt(left[i] - right[i])
	}
	return ans
}

func puzzle2(left []int, right []int) int {
	ans := 0
	for _, l := range left {
		ans += occurances(l, right)
	}
	return ans
}

var cache = make(map[int]int)

func occurances(n int, right []int) int {
	if v, ok := cache[n]; ok {
		return v
	}
	count := 0
	for _, r := range right {
		if n == r {
			count++
		}
	}
	ans := n * count
	cache[n] = ans
	return ans
}

func LeftRightInts(lines []string) ([]int, []int) {
	left := make([]int, 0)
	right := make([]int, 0)
	for _, line := range lines {
		entries := strings.Split(line, " ")
		l := strings.TrimSpace(entries[0])
		r := strings.TrimSpace(entries[len(entries)-1])
		if l == "" || r == "" {
			break
		}
		left = append(left, cl.Number(l))
		right = append(right, cl.Number(r))
	}
	return left, right
}
