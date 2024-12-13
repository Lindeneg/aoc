package main

import (
	"strconv"
	"strings"

	"github.com/lindeneg/aoc/cl"
)

func main() {
	example := cl.NewInput("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 65079,
			Fn:   func() int { return puzzle(example, false) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 956,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 40149,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

const (
	ASSIGN = "ASSIGN"
	NOT    = "NOT"
	AND    = "AND"
	OR     = "OR"
	LSHIFT = "LSHIFT"
	RSHIFT = "RSHIFT"
)

var unaryName = []string{ASSIGN, NOT}

var unary = map[string]func(uint16) uint16{
	ASSIGN: func(a uint16) uint16 { return a },
	NOT:    func(a uint16) uint16 { return ^a },
}

var binary = map[string]func(uint16, uint16) uint16{
	AND:    func(a, b uint16) uint16 { return a & b },
	OR:     func(a, b uint16) uint16 { return a | b },
	LSHIFT: func(a, b uint16) uint16 { return a << b },
	RSHIFT: func(a, b uint16) uint16 { return a >> b },
}

func puzzle(input cl.Input, part2 bool) int {
	c := NewC()
	for _, line := range input.R1 {
		c.addOp(line)
	}
	if part2 {
		tmp := c.eval("a")
		c.reset()
		c.ops["b"] = strconv.Itoa(int(tmp))
	}
	return int(c.eval("a"))
}

type C struct {
	ops     map[string]string
	signals map[string]uint16
}

func NewC() *C {
	return &C{
		ops:     make(map[string]string),
		signals: make(map[string]uint16),
	}
}

func (c *C) reset() {
	c.signals = make(map[string]uint16)
}

func (c *C) eval(wire string) uint16 {
	if value, err := strconv.Atoi(wire); err == nil {
		return uint16(value)
	}
	if val, found := c.signals[wire]; found {
		return val
	}
	op := c.ops[wire]
	parts := strings.Split(op, " ")
	lp := len(parts)
	var v uint16
	if lp < 3 {
		fn, ok := unary[unaryName[lp-1]]
		if !ok {
			panic("unknown operator")
		}
		v = fn(c.eval(parts[lp-1]))
		c.signals[wire] = v
		return v
	}
	left := c.eval(parts[0])
	right := c.eval(parts[2])
	fn, ok := binary[parts[1]]
	if !ok {
		panic("unknown operator")
	}
	v = fn(left, right)
	c.signals[wire] = v
	return v
}

func (c *C) addOp(line string) {
	parts := strings.Split(line, " -> ")
	c.ops[parts[1]] = parts[0]
}
