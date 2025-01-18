package main

import (
	"bytes"

	"github.com/lindeneg/aoc/cl"
)

var directions = map[byte]cl.Vec2{
	'^': cl.V2(0, -1),
	'v': cl.V2(0, 1),
	'<': cl.V2(-1, 0),
	'>': cl.V2(1, 0),
}

func main() {
	example1 := cl.NewInputD("example1.in")
	example2 := cl.NewInputD("example2.in")
	cl.Example(
		cl.Ex[int]{
			Want: 2028,
			Fn:   func() int { return puzzle(example1, false) },
		},
		cl.Ex[int]{
			Want: 10092,
			Fn:   func() int { return puzzle(example2, false) },
		},
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
		cl.Ex[int]{
			Want: 1458740,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	g, r := makeMap(cl.B2(bytes.Split(input.B1[0], []byte{'\n'})), part2)
outer:
	for _, v := range input.B1[1] {
		if v == '\n' {
			continue outer
		}
		np := r.Add(directions[v])
		switch g.V(np) {
		case '#':
			continue outer
		case '.':
			r = np
		case '[', ']', 'O':
			q := cl.NewQueue[cl.Vec2]()
			q.Push(r)
			seen := cl.NewSeen[cl.Vec2]()
			wall := false
		inner:
			for !q.Empty() {
				np = q.Pop()
				if seen.Has(np) {
					continue inner
				}
				seen.Add(np)
				nnp := np.Add(directions[v])
				switch g.V(nnp) {
				case '#':
					wall = true
					break inner
				case 'O':
					q.Push(nnp)
				case '[':
					q.Push(nnp)
					right := nnp.Right()
					cl.AssertE(g.V(right), ']')
					q.Push(right)
				case ']':
					q.Push(nnp)
					left := nnp.Left()
					cl.AssertE(g.V(left), '[')
					q.Push(left)
				}
			}
			if wall {
				continue outer
			}
			for seen.Len() > 0 {
				keys := seen.Sorted(cl.Vec2Less)
				for _, k := range keys {
					nk := k.Add(directions[v])
					if !seen.Has(nk) {
						cl.AssertE(g.V(nk), '.')
						g.S(nk, g.V(k))
						g.S(k, '.')
						seen.Remove(k)
					}
				}
			}
			r = r.Add(directions[v])
		}
	}
	return sumPositions(g)
}

func sumPositions(B2 cl.B2) int {
	ans := 0
	for y := 0; y < len(B2); y++ {
		for x := 0; x < len(B2[y]); x++ {
			v := B2.V(cl.V2(x, y))
			if v == '[' || v == 'O' {
				ans += (100 * y) + x
			}
		}
	}
	return ans
}

func makeMap(B2 cl.B2, part2 bool) (cl.B2, cl.Vec2) {
	g := cl.B2{}
	var rp cl.Vec2
	for y := 0; y < len(B2); y++ {
		r := []byte{}
		for x := 0; x < len(B2[y]); x++ {
			p := cl.V2(x, y)
			c := B2.V(p)
			if part2 {
				switch c {
				case 'O':
					r = append(r, '[', ']')
				case '@':
					rp = cl.V2(p.X*2, p.Y)
					r = append(r, '.', '.')
				default:
					r = append(r, c, c)
				}
			} else {
				if c == '@' {
					rp = p
					c = '.'
				}
				r = append(r, c)
			}
		}
		g = append(g, r)
	}
	return g, rp
}
