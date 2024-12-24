package main

import (
	"bytes"
	"fmt"
	"math"
	"strconv"
	"strings"

	"github.com/lindeneg/aoc/cl"
)

const (
	Adv u3 = iota
	Bxl
	Bst
	Jnz
	Bxc
	Out
	Bdv
	Cdv
)

type octstr struct {
	sb strings.Builder
}

func (o *octstr) prepend(dec int) {}

func main() {
	example1 := cl.NewInputD("example1.in")
	cl.ExpectRun(
		"Example",
		1,
		cl.Ex[string]{
			Want: "4,6,3,5,6,3,5,2,1,0",
			Fn:   func() string { return part1(example1) },
		},
	)
	example2 := cl.NewInputD("example2.in")
	cl.ExpectRun(
		"Example",
		2,
		cl.Ex[int]{
			Want: 117440,
			Fn:   func() int { return part2(example2) },
		},
	)
	input := cl.NewInputD("puzzle.in")
	cl.ExpectRun(
		"Puzzle",
		1,
		cl.Ex[string]{
			Want: "7,1,3,7,5,1,0,3,4",
			Fn:   func() string { return part1(input) },
		},
	)
	cl.ExpectRun(
		"Puzzle",
		2,
		cl.Ex[int]{
			Want: 190384113204239,
			Fn:   func() int { return part2(input) },
		},
	)
}

func part1(input cl.Input) string {
	machine, program := parseMachine(input.B1)
	return eval(machine, program, false).String()
}

func part2(input cl.Input) int {
	machine, program := parseMachine(input.B1)
	a := 0
	aInitial := 0
	best := 0
	offset := 0
	digits := 0
	for {
		a++
		// aInitial = a*int(math.Pow(8, 0)) + 0          // 036017
		// aInitial = a*int(math.Pow(8, 5)) + 036017     // 01340
		// aInitial = a*int(math.Pow(8, 9)) + 0134036017
		aInitial = a*int(math.Pow(8, float64(digits))) + OctalToDecimal(offset)
		machine['A'] = aInitial
		machine['B'] = 0
		machine['C'] = 0
		e := eval(machine, program, true)
		if e.Equal(program) {
			return aInitial
		} else if len(e) > best {
			oct := Octal(a)
			// what the fuck are you doing mate
			if digits == 0 && cl.DigitCount(oct) == 5 {
				digits = 5
				offset = oct
				a = 0
			} else if digits == 5 && cl.DigitCount(oct) == 4 {
				digits = 9
				offset = (oct * int(math.Pow10(5))) + offset
				a = 0
			}
			best = len(e)
		}
	}
}

type u3 uint8
type u3s []u3

func (u u3s) Equal(v u3s) bool {
	if len(u) != len(v) {
		return false
	}
	for i, uu := range u {
		if uu != v[i] {
			return false
		}
	}
	return true
}

func (u u3s) String() string {
	sb := strings.Builder{}
	for i, uu := range u {
		sb.WriteString(strconv.Itoa(int(uu)))
		if i < len(u)-1 {
			sb.WriteString(",")
		}
	}
	return sb.String()
}

func mask(n int) u3 {
	return u3(n & 0x07)
}

func unmask(n u3) int {
	return int(n)
}

type regs map[byte]int

func eval(machine regs, program u3s, part2 bool) u3s {
	ptr := 0
	out := make(u3s, 0)
outer:
	for ptr < len(program) {
		instr := program[ptr]
		inc := 2
		switch instr {
		case Adv:
			num := machine['A']
			com := combo(machine, program[ptr+1])
			machine['A'] = num / (1 << com)
		case Bxl:
			num := machine['B']
			lit := program[ptr+1]
			machine['B'] = num ^ unmask(lit)
		case Bst:
			com := combo(machine, program[ptr+1])
			machine['B'] = com % 8
		case Jnz:
			areg := machine['A']
			if areg == 0 {
				break
			}
			lit := program[ptr+1]
			ptr = unmask(lit)
			continue outer
		case Bxc:
			b := machine['B']
			c := machine['C']
			machine['B'] = b ^ c
		case Out:
			com := combo(machine, program[ptr+1]) % 8
			out = append(out, u3(com))
			if part2 && out[len(out)-1] != program[len(out)-1] {
				return u3s{}
			}
		case Bdv:
			num := machine['A']
			com := combo(machine, program[ptr+1])
			machine['B'] = num / (1 << com)
		case Cdv:
			num := machine['A']
			com := combo(machine, program[ptr+1])
			machine['C'] = num / (1 << com)
		}
		ptr += inc
	}
	return out
}

func combo(m regs, operand u3) int {
	switch operand {
	case 4:
		return m['A']
	case 5:
		return m['B']
	case 6:
		return m['C']
	case 7:
		cl.VerifyNotReached()
	}
	return unmask(operand)
}

func parseMachine(B1 [][]byte) (regs, u3s) {
	machine := make(regs)
	program := make(u3s, 0)
	r := bytes.Split(B1[0], []byte{'\n'})
	for _, rr := range r {
		var a byte
		var b int
		fmt.Sscanf(string(rr), "Register %c: %d", &a, &b)
		cl.AssertM(a >= 'A' && a <= 'Z', "invalid register")
		cl.AssertM(b >= 0, "invalid value")
		machine[a] = b
	}
	p := bytes.Split(bytes.TrimPrefix(B1[1], []byte("Program: ")), []byte{','})
	for _, pp := range p {
		program = append(program, mask(int(pp[0])-48))
	}
	return machine, program
}

func Octal(n int) int {
	if n == 0 {
		return 0
	}

	result := 0
	multiplier := 1

	for n > 0 {
		remainder := n % 8
		n = n / 8
		result += remainder * multiplier
		multiplier *= 10
	}

	return result
}

func OctalToDecimal(n int) int {
	decimal := 0
	multiplier := 1

	for n > 0 {
		decimal += (n % 10) * multiplier
		n = n / 10
		multiplier *= 8
	}

	return decimal
}
