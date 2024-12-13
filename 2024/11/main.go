package main

import (
	"fmt"
	"math"

	"github.com/lindeneg/aoc/cl"
)

func main() {
	example := cl.NewInputSS("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 55312,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 65601038650482,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInputSS("puzzle.in")
	cl.Puzzle(

		cl.Ex[int]{
			Want: 182081,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 216318908621637,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	var blinks int
	if part2 {
		blinks = 75
	} else {
		blinks = 25
	}
	stones := makeStones(input.R1)
	ans := 0
	for _, v := range stones {
		ans += score(v, blinks)
	}
	return ans
}

var scoreCache = map[string]int{}

func score(stone int, round int) int {
	key := fmt.Sprintf("%d-%d", stone, round)
	if v, ok := scoreCache[key]; ok {
		return v
	}
	if round == 0 {
		return 1
	}
	evaled := eval(stone)

	ans := 0
	for _, v := range evaled {
		ans += score(v, round-1)
	}
	scoreCache[key] = ans
	return ans
}

func eval(n int) []int {
	if n == 0 {
		return []int{1}
	}
	if n1, n2, ok := splitNumber(n); ok {
		return []int{n1, n2}
	}
	return []int{n * 2024}
}

func makeStones(R1 []string) []int {
	stones := make([]int, len(R1))
	for i, v := range R1 {
		stones[i] = cl.Number(v)
	}
	return stones
}

func splitNumber(n int) (int, int, bool) {
	digitCount := int(math.Floor(math.Log10(float64(n)))) + 1
	if digitCount%2 != 0 {
		return 0, 0, false
	}
	halfDigits := digitCount / 2
	divisor := int(math.Pow(10, float64(halfDigits)))
	n1 := n / divisor
	n2 := n % divisor
	return n1, n2, true
}
