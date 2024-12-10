package main

import (
	"math"
	"sort"
	"strings"

	"github.com/lindeneg/aoc/cl"
)

type R map[int][]int

func main() {
	example := cl.NewInputD("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 143,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 123,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInputD("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 5391,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 6142,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	rules := initRules(strings.Split(input.R1[0], "\n"))
	updates := initUpdates(strings.Split(input.R1[1], "\n"))
	ans := 0
	for _, v := range updates {
		ans += solve(rules, v, part2)
	}
	return ans
}

func solve(rules R, update []int, part2 bool) int {
	for i, v := range update {
		if brokenRules(rules, v, i, update) {
			if part2 {
				return puzzle2(rules, update)
			}
			return 0
		}
	}
	if part2 {
		return 0
	}
	return update[int(math.Ceil(float64(len(update)/2.0)))]
}

func puzzle2(rules R, update []int) int {
	arr := make([]int, len(update))
	copy(arr, update)
	sort.Slice(arr, func(i, j int) bool {
		r := getRule(rules, arr[i])
		if len(r) == 0 {
			return true
		}
		for _, v := range r {
			if v == arr[j] {
				return false
			}
		}
		return true
	})
	return arr[int(math.Ceil(float64(len(arr)/2.0)))]
}

func getRule(rules R, v int) []int {
	r, ok := rules[v]
	if !ok {
		return []int{}
	}
	return r
}

func brokenRules(rules R, v int, i int, update []int) bool {
	vRules := getRule(rules, v)
	for _, r := range vRules {
		for _, p := range update[i:] {
			if r == p {
				return true
			}
		}
	}
	return false
}

func initRules(ordering []string) R {
	rules := make(R, 0)
	for _, v := range ordering {
		splitted := strings.Split(v, "|")
		key, rule := cl.Number(splitted[0]), cl.Number(splitted[1])
		if _, ok := rules[rule]; !ok {
			rules[rule] = []int{key}
		} else {
			rules[rule] = append(rules[rule], key)
		}
	}
	return rules
}

func initUpdates(updates []string) [][]int {
	ns := make([][]int, 0)
	for _, v := range updates {
		nn := make([]int, 0)
		splitted := strings.Split(v, ",")
		for _, v := range splitted {
			nn = append(nn, cl.Number(v))
		}
		ns = append(ns, nn)
	}
	return ns
}
