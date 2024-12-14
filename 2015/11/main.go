package main

import (
	"bytes"

	"github.com/lindeneg/aoc/cl"
)

func main() {
	example1 := cl.NewInputS("example1.in")
	example2 := cl.NewInputS("example2.in")
	cl.Example(
		cl.Ex[string]{
			Want: "abcdffaa",
			Fn:   func() string { return puzzle(example1, false) },
		},
		cl.Ex[string]{
			Want: "ghjaabcc",
			Fn:   func() string { return puzzle(example2, false) },
		},
	)
	input := cl.NewInputS("puzzle.in")
	cl.Puzzle(
		cl.Ex[string]{
			Want: "vzbxxyzz",
			Fn:   func() string { return puzzle(input, false) },
		},
		cl.Ex[string]{
			Want: "vzcaabcc",
			Fn:   func() string { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) string {
	cpy := func(B []byte) []byte {
		b := make([]byte, len(B))
		copy(b, B)
		return b
	}
	pwd := generatePassword(cpy(input.B))
	if part2 {
		pwd = generatePassword(cpy(pwd))
	}
	return string(pwd)
}

func generatePassword(B []byte) []byte {
	for {
		i := len(B) - 1
		for i >= 0 {
			B[i] = nextByte(B[i])
			if B[i] != 'a' {
				break
			}
			i--
		}
		if !hasIllegal(B...) && hasStraight(B) && hasTwoPairs(B) {
			break
		}
	}
	return B
}

func nextByte(b byte) byte {
	next := (b + 1) % 123
	if next < 97 {
		next = 97
	}
	return next
}

func hasIllegal(B ...byte) bool {
	for _, b := range B {
		if b == 'i' || b == 'o' || b == 'l' {
			return true
		}
	}
	return bytes.ContainsAny(B, "iol")
}

func hasStraight(B []byte) bool {
	for i := 0; i < len(B)-2; i++ {
		if B[i]+1 == B[i+1] && B[i]+2 == B[i+2] {
			return true
		}
	}
	return false
}

func hasTwoPairs(B []byte) bool {
	pairs := 0
	for i := 0; i < len(B)-1; i++ {
		if B[i] == B[i+1] {
			pairs++
			i++
		}
	}
	return pairs >= 2
}
