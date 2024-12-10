package main

import (
	"github.com/lindeneg/aoc/cl"
)

func main() {
	example1 := cl.NewInputS("example1.in")
	example2 := cl.NewInputS("example2.in")
	cl.Example(
		cl.Ex[int]{
			Want: 161,
			Fn:   func() int { return puzzle(example1, false) },
		},
		cl.Ex[int]{
			Want: 48,
			Fn:   func() int { return puzzle(example2, true) },
		},
	)
	input := cl.NewInputS("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 188116424,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 104245808,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(in cl.Input, part2 bool) int {
	expr := false
	product := 0
	enabled := true
	for i, v := range in.B {
		switch v {
		case 'd':
			if part2 {
				if !cl.ExpectPeek(in.B, i+1, "o") {
					continue
				}
				if cl.ExpectPeek(in.B, i+2, "()") {
					enabled = true
					i += 3
					continue
				}
				if cl.ExpectPeek(in.B, i+2, "n't()") {
					enabled = false
					i += 5
					continue
				}
			}
		case 'm':
			if cl.ExpectPeek(in.B, i+1, "ul(") {
				expr = true
				i += 3
			}
		case '(':
			if !expr {
				continue
			}
			n, idx := cl.ReadUntil(in.B, i+1, ',', "0123456789")
			i += idx
			n2, idx := cl.ReadUntil(in.B, i+1, ')', "0123456789")
			i += idx
			if n != "" && n2 != "" && (!part2 || enabled) {
				product += cl.Number(n) * cl.Number(n2)
			}
			expr = false
		}
	}
	return product
}
