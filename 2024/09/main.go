package main

import (
	"github.com/lindeneg/aoc/cl"
)

const (
	Free = -1
)

func main() {
	example := cl.NewInputS("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 1928,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 2858,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInputS("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 6258319840548,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 6286182965311,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	bls, mem := blocks(input)

	if part2 {
		puzzle2(bls, mem)
	} else {
		puzzle1(bls)
	}

	ans := 0
	for i, v := range bls {
		if v == Free {
			continue
		}
		ans += (i * v)
	}
	return ans
}

type M []cl.Vec2

func (m M) free(n int, idx int) cl.Vec3 {
	best := cl.Vec3{X: Free}
	for i, v := range m {
		if v.Y >= n && v.X < idx {
			if best.X == Free {
				best = v.Vec3(i)
				continue
			}
			if v.X < best.X && v.Y <= best.Y {
				best = v.Vec3(i)
			}
		}
	}
	return best
}

func (m M) insert(i int, n int) cl.Vec3 {
	if m[i].Y >= n {
		m[i].X += n
		m[i].Y -= n
	}
	return m[i].Vec3(i)
}

func puzzle1(bls []int) {
	lp := 0
	rp := len(bls) - 1
Outer:
	for {
		if lp >= rp {
			break
		}
		fp := cl.Vec2{X: lp}
		for bls[fp.X] != Free {
			fp.X++
			if fp.X >= len(bls) {
				break Outer
			}
		}
		fp.Y = fp.X
		for bls[fp.Y] == Free {
			fp.Y++
			if fp.Y >= len(bls) {
				break Outer
			}
		}
		r1 := fp.Y - fp.X
		rp2 := rp
		dp := []cl.Vec2{}
		if rp-r1 < 0 {
			break
		}
		for rp2 >= 0 && len(dp) < r1 {
			if bls[rp2] != Free {
				dp = append(dp, cl.Vec2{X: rp2, Y: bls[rp2]})
			}
			rp2--
			if rp2 < 0 {
				break Outer
			}
		}
		j := 0
		for i := fp.X; i < fp.Y; i++ {
			bls[i] = dp[j].Y
			bls[dp[j].X] = -1
			j++
		}

		lp += r1
		rp -= len(dp)
	}
}

func puzzle2(bls []int, mem M) {
	rp := len(bls) - 1
	for rp >= 0 {
		c := bls[rp]
		if c == Free {
			rp--
			continue
		}
		b := []int{}
		for bls[rp] == c {
			b = append(b, rp)
			rp--
			if rp < 0 {
				break
			}
		}
		m := mem.free(len(b), b[len(b)-1])
		if m.Z == Free || m.Y == 0 {
			continue
		}
		for _, bb := range b {
			c := bls[bb]
			bls[bb] = Free
			bls[m.X] = c
			m = mem.insert(m.Z, 1)
		}
	}
}

func blocks(input cl.Input) ([]int, M) {
	id := 0
	t := []int{}
	mem := M{}
	for i, v := range input.R1 {
		np := cl.Number(v)
		isFile := i%2 == 0
		ii := 0
		memSize := 0
		memIdx := 0
		for ii < np {
			if isFile {
				t = append(t, id)
			} else {
				if memSize == 0 {
					memIdx = len(t)
				}
				memSize++
				t = append(t, Free)
			}
			ii++
		}
		if isFile {
			id++
		} else if memSize > 0 {
			mem = append(mem, cl.Vec2{X: memIdx, Y: memSize})
		}
	}
	return t, mem
}
