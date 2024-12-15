package main

import (
	"bytes"

	"github.com/lindeneg/aoc/cl"
)

const (
	Robot    byte = '@'
	Box      byte = 'O'
	Wall     byte = '#'
	Free     byte = '.'
	BoxStart byte = '['
	BoxEnd   byte = ']'

	Up    byte = '^'
	Down  byte = 'v'
	Left  byte = '<'
	Right byte = '>'
)

var directions = map[byte]cl.Vec2{
	Up:    cl.V2(0, -1),
	Down:  cl.V2(0, 1),
	Left:  cl.V2(-1, 0),
	Right: cl.V2(1, 0),
}

func main() {
	//	example1 := cl.NewInputD("example1.in")
	example2 := cl.NewInputD("example2.in")
	cl.Example(
		//		cl.Ex[int]{
		//			Want: 2028,
		//			Fn:   func() int { return puzzle(example1, false) },
		//		},
		//		cl.Ex[int]{
		//			Want: 10092,
		//			Fn:   func() int { return puzzle(example2, false) },
		//		},
		cl.Ex[int]{
			Want: 9021,
			Fn:   func() int { return puzzle(example2, true) },
		},
	)
	input := cl.NewInputD("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 1430439,
			Fn:   func() int { return puzzle(input, false) },
		},
		//		cl.Ex[int]{
		//			Want: 0,
		//			Fn:   func() int { return puzzle(input, true) },
		//		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	B2, r := grid(bytes.Split(input.B1[0], []byte{10}), part2)
	i := 0
	for i < len(input.B1[1]) {
		c := input.B1[1][i]
		switch c {
		case Up, Down, Left, Right:
			r = move(B2, directions[c], r)
		}
		i++
	}
	return sumPositions(B2)
}

func sumPositions(B2 cl.B2) int {
	ans := 0
	for y := 0; y < len(B2); y++ {
		for x := 0; x < len(B2[y]); x++ {
			p := cl.V2(x, y)
			if B2.V(p) == Box {
				ans += ((100 * p.Y) + p.X)
			}
		}
	}
	return ans
}

func move(B2 cl.B2, dir cl.Vec2, r cl.Vec2) cl.Vec2 {
	np := r.Add(dir)
	if !B2.ValidIdx(np) {
		return r
	}
	next := B2.V(np)
	switch next {
	case Wall:
		return r
	case Free:
		B2.S(r, Free)
		B2.S(np, Robot)
		return np
	case Box:
		boxes := []cl.Vec2{}
		nn := np
		for {
			if B2.V(nn) != Box {
				break
			}
			boxes = append(boxes, nn)
			nn = nn.Add(dir)
		}

		last := boxes[len(boxes)-1]
		if B2.V(last.Add(dir)) != Free {
			return r
		}
		B2.S(r, Free)
		B2.S(last.Add(dir), Box)
		B2.S(np, Robot)
		return np
	}
	return r
}

func grid(B2 cl.B2, part2 bool) (cl.B2, cl.Vec2) {
	g := make(cl.B2, len(B2))
	var robot cl.Vec2
	for y := 0; y < len(B2); y++ {
		for x := 0; x < len(B2[y]); x++ {
			p := cl.V2(x, y)
			c := B2.V(p)
			arr := []byte{}
			if c == Robot {
				robot = p
			}
			if part2 {
				switch c {
				case Robot:
					g[y] = append(g[y], Robot, Free)
					break
				case Box:
					g[y] = append(g[y], BoxStart, BoxEnd)
					break
				default:
					arr = append(arr, c, c)
				}
			} else {
				arr = append(arr, c)
			}
			for _, v := range arr {
				g[y] = append(g[y], v)
			}
		}
	}
	g.Print()
	return g, robot
}
