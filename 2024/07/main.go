package main

import (
	"strings"

	"github.com/lindeneg/aoc/cl"
)

var (
	P1Operators = []string{"+", "*"}
	P2Operators = []string{"+", "*", "||"}
)

func main() {
	example := cl.NewInput("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 3749,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 11387,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 8401132154762,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 95297119227552,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	var operators []string
	if part2 {
		operators = P2Operators
	} else {
		operators = P1Operators
	}
	ans := 0
	for _, v := range input.R1 {
		split := strings.Split(v, ": ")
		expected := cl.Number(split[0])
		operands := makeNumbers(split[1])
		cfg := makeConfig(operands, operators)
		ans += solve(expected, operands, cfg)
	}
	return ans
}

func solve(want int, operands []int, configs [][]string) int {
	for _, v := range configs {
		if calculate(operands, v) == want {
			return want
		}
	}
	return 0
}

func calculate(operands []int, operators []string) int {
	ans := operands[0]
	for i, v := range operators {
		switch v {
		case "+":
			ans += operands[i+1]
		case "*":
			ans *= operands[i+1]
		case "||":
			ans = combineNumbers(ans, operands[i+1])
		}
	}
	return ans
}

func combineNumbers(a, b int) int {
	multiplier := 1
	for b >= multiplier {
		multiplier *= 10
	}
	return a*multiplier + b
}

var cfgCache = make(map[int][][]string)

func makeConfig(operands []int, operators []string) [][]string {
	n := len(operands)
	if n < 2 {
		return [][]string{}
	}
	numSlots := n - 1
	numOperators := len(operators)
	totalConfigs := 1
	for i := 0; i < numSlots; i++ {
		totalConfigs *= numOperators
	}
	if cfg, ok := cfgCache[totalConfigs]; ok {
		return cfg
	}
	configs := [][]string{}
	for i := 0; i < totalConfigs; i++ {
		config := []string{}
		temp := i
		for j := 0; j < numSlots; j++ {
			operatorIndex := temp % numOperators
			config = append(config, operators[operatorIndex])
			temp /= numOperators
		}
		configs = append(configs, config)
	}
	cfgCache[totalConfigs] = configs
	return configs
}

func makeNumbers(s string) []int {
	var a []int
	for _, v := range strings.Split(s, " ") {
		a = append(a, cl.Number(v))
	}
	return a
}

func endsWith(a, b int) bool {
	for b > 0 {
		if a%10 != b%10 {
			return false
		}
		a /= 10
		b /= 10
	}
	return true
}
