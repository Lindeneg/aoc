package main

import (
	"encoding/json"

	"github.com/lindeneg/aoc/cl"
)

func main() {
	example := cl.ReadFile("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 38,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 13,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.ReadFile("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 111754,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 65402,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(b []byte, part2 bool) int {
	var j interface{}
	if err := json.Unmarshal(b, &j); err != nil {
		panic(err)
	}
	return sum(j, part2)
}

func sum(obj interface{}, part2 bool) int {
	switch v := obj.(type) {
	case []interface{}:
		total := 0
		for _, item := range v {
			total += sum(item, part2)
		}
		return total
	case float64:
		if v == float64(int(v)) {
			return int(v)
		}
		return 0
	case map[string]interface{}:
		if part2 {
			for _, val := range v {
				if str, ok := val.(string); ok && str == "red" {
					return 0
				}
			}
		}
		total := 0
		for _, val := range v {
			total += sum(val, part2)
		}
		return total
	default:
		return 0
	}
}
