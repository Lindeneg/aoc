package main

import (
	"fmt"
	"math"

	"github.com/lindeneg/aoc/cl"
)

func main() {
	example := cl.NewInput("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 12,
			Fn:   func() int { return puzzle(example, false) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 226236192,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 8168,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	var size cl.Vec2
	fmt.Sscanf(input.R1[0], "%d,%d", &size.X, &size.Y)
	halfSize := cl.V2(int(math.Floor(float64(size.X)/2)), int(math.Floor(float64(size.Y)/2)))
	r := findRobots(input.R1[1:])
	rr := r
	avgS := 0
	i := 0
	for {
		if !part2 && i == 100 {
			break
		}
		if part2 {
			ss := safetyScore(rr, size, halfSize)
			na := (avgS + ss) / (i + 1)
			if na < (avgS / 5) { // detect anomaly
				return i

			}
			avgS = na
		}
		rrr := make(R, len(rr))
		for pos, rs := range rr {
			for _, r := range rs {
				newPos := pos.Add(r.vel)
				if newPos.X < 0 {
					newPos.X = size.X + newPos.X
				}
				if newPos.X >= size.X {
					newPos.X = newPos.X % size.X
				}
				if newPos.Y < 0 {
					newPos.Y = size.Y + newPos.Y
				}
				if newPos.Y >= size.Y {
					newPos.Y = newPos.Y % size.Y
				}
				rrr[newPos] = append(rrr[newPos], r)
			}
		}
		rr = rrr
		i++
	}
	return safetyScore(rr, size, halfSize)
}

func safetyScore(r R, size cl.Vec2, halfSize cl.Vec2) int {
	q := [4]int{0, 0, 0, 0}
	for pos, rs := range r {
		if pos.X >= 0 && pos.X < halfSize.X && pos.Y >= 0 && pos.Y < halfSize.Y {
			q[0] += len(rs)
			continue
		}
		if pos.X > halfSize.X && pos.X < size.X && pos.Y >= 0 && pos.Y < halfSize.Y {
			q[1] += len(rs)
			continue
		}
		if pos.X >= 0 && pos.X < halfSize.X && pos.Y > halfSize.Y && pos.Y < size.Y {
			q[2] += len(rs)
			continue
		}
		if pos.X > halfSize.X && pos.X < size.X && pos.Y > halfSize.Y && pos.Y < size.Y {
			q[3] += len(rs)
			continue
		}
	}
	return q[0] * q[1] * q[2] * q[3]
}

type R map[cl.Vec2][]robot

type robot struct {
	pos cl.Vec2
	vel cl.Vec2
}

func (r robot) String() string {
	return fmt.Sprintf("p=%v,v=%v", r.pos, r.vel)
}

func findRobots(input []string) R {
	robots := make(R, len(input))
	for _, v := range input {
		var r robot
		fmt.Sscanf(v, "p=%d,%d v=%d,%d", &r.pos.X, &r.pos.Y, &r.vel.X, &r.vel.Y)
		robots[r.pos] = append(robots[r.pos], r)
	}
	return robots
}
