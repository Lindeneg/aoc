package main

import (
	"strings"

	"github.com/lindeneg/aoc/cl"
)

func main() {
	example := cl.NewInput("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 2,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 4,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 242,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 311,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	safe := 0
	for _, l := range input.R1 {
		r := line(l).parseLine()
		if part2 {
			safe += r.safeInt2()
		} else {
			safe += r.safeInt1()
		}
	}
	return safe
}

const (
	NONE = iota
	INCREASING
	DECREASING
)

type line string
type iline []int

func (l line) parseLine() iline {
	is := make([]int, 0)
	ll := strings.Split(string(l), " ")
	for _, s := range ll {
		is = append(is, cl.Number(s))
	}
	return is
}

func (l iline) removeEl(idx int) iline {
	newSlice := make(iline, 0)
	for i, ll := range l {
		if i == idx {
			continue
		}
		newSlice = append(newSlice, ll)
	}
	return newSlice
}

func (l iline) safeInt1() int {
	if len(l) < 2 {
		return 0
	}
	mode := NONE
	if l[0] < l[1] {
		mode = INCREASING
	} else {
		mode = DECREASING
	}
	for i, ll := range l {
		if i == len(l)-1 {
			break
		}
		if mode == INCREASING && ll >= l[i+1] {
			return 0 // UNSAFE
		}
		if mode == DECREASING && ll <= l[i+1] {
			return 0 // UNSAFE
		}
		diff := cl.AbsInt(ll - l[i+1])
		if diff < 1 || diff > 3 {
			return 0 // UNSAFE
		}
	}
	return 1 // SAFE
}

func (l iline) safeInt2() int {
	s := l.safeInt1()
	if s == 1 {
		return 1
	}
	i := 0
	for i < len(l) {
		ns := l.removeEl(i)
		if ns.safeInt1() == 1 {
			return 1
		}
		i += 1
	}
	return 0
}
