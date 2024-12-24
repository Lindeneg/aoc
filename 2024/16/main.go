package main

import (
	"github.com/lindeneg/aoc/cl"
)

func main() {
	example1 := cl.NewInput("example1.in")
	example2 := cl.NewInput("example2.in")
	cl.Example(
		cl.Ex[int]{
			Want: 7036,
			Fn:   func() int { return puzzle(example1, false) },
		},
		cl.Ex[int]{
			Want: 11048,
			Fn:   func() int { return puzzle(example2, false) },
		},
		cl.Ex[int]{
			Want: 45,
			Fn:   func() int { return puzzle(example1, true) },
		},
		cl.Ex[int]{
			Want: 64,
			Fn:   func() int { return puzzle(example2, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 114476,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 508,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	g, start, end := makeMap(input.B1)
	minCost, tileCount := solveMaze(g, start, end)
	if part2 {
		return tileCount
	}
	return minCost
}

type state struct {
	r, c, d int // row, column, direction
}

type item struct {
	st   state
	cost int
}

// Directions: 0=East, 1=South, 2=West, 3=North
var dr = []int{0, 1, 0, -1}
var dc = []int{1, 0, -1, 0}

func rotateLeft(d int) int {
	return (d + 3) % 4
}
func rotateRight(d int) int {
	return (d + 1) % 4
}

type costMap map[cl.Vec3]int

func solveMaze(m [][]byte, start, end cl.Vec2) (int, int) {
	rows := len(m)
	cols := len(m[0])

	// costMap[r][c][d] = minimal cost known to reach (r,c,d)
	costMap := make([][][]int, rows)
	for r := 0; r < rows; r++ {
		costMap[r] = make([][]int, cols)
		for c := 0; c < cols; c++ {
			costMap[r][c] = make([]int, 4)
			for d := 0; d < 4; d++ {
				costMap[r][c][d] = -1
			}
		}
	}

	isWall := func(r, c int) bool {
		if r < 0 || r >= rows || c < 0 || c >= cols {
			return true
		}
		return m[r][c] == '#'
	}

	startState := state{start.Y, start.X, 0} // facing East
	costMap[start.Y][start.X][0] = 0

	pq := cl.NewPrio(func(a, b item) bool {
		return a.cost < b.cost
	})
	pq.Add(item{startState, 0})

	for pq.Len() > 0 {
		it := pq.Next()
		r, c, d := it.st.r, it.st.c, it.st.d
		currCost := it.cost
		if costMap[r][c][d] != currCost {
			continue
		}
		// If we've reached E
		if r == end.Y && c == end.X {
			// The first time we pop E from PQ in Dijkstra is the minimal cost
			break
		}

		// Move forward
		nr := r + dr[d]
		nc := c + dc[d]
		if !isWall(nr, nc) {
			newCost := currCost + 1
			if costMap[nr][nc][d] == -1 || newCost < costMap[nr][nc][d] {
				costMap[nr][nc][d] = newCost
				pq.Add(item{state{nr, nc, d}, newCost})
			}
		}

		// Rotate left
		ld := rotateLeft(d)
		newCost := currCost + 1000
		if costMap[r][c][ld] == -1 || newCost < costMap[r][c][ld] {
			costMap[r][c][ld] = newCost
			pq.Add(item{state{r, c, ld}, newCost})
		}

		// Rotate right
		rd := rotateRight(d)
		newCost = currCost + 1000
		if costMap[r][c][rd] == -1 || newCost < costMap[r][c][rd] {
			costMap[r][c][rd] = newCost
			pq.Add(item{state{r, c, rd}, newCost})
		}
	}

	// Minimal cost at E
	minCost := -1
	for d := 0; d < 4; d++ {
		val := costMap[end.Y][end.X][d]
		if val != -1 {
			if minCost == -1 || val < minCost {
				minCost = val
			}
		}
	}

	if minCost == -1 {
		// No path found
		return -1, 0
	}

	// Backtrack to find all tiles on best paths
	visited := make([][][]bool, rows)
	for r := 0; r < rows; r++ {
		visited[r] = make([][]bool, cols)
		for c := 0; c < cols; c++ {
			visited[r][c] = make([]bool, 4)
		}
	}

	queue := []state{}
	for d := 0; d < 4; d++ {
		if costMap[end.Y][end.X][d] == minCost {
			visited[end.Y][end.X][d] = true
			queue = append(queue, state{end.Y, end.X, d})
		}
	}

	for len(queue) > 0 {
		curr := queue[len(queue)-1]
		queue = queue[:len(queue)-1]
		r, c, d := curr.r, curr.c, curr.d
		currCost := costMap[r][c][d]

		// predecessor by moving forward
		pr := r - dr[d]
		pc := c - dc[d]
		if pr >= 0 && pr < rows && pc >= 0 && pc < cols && !isWall(pr, pc) {
			if costMap[pr][pc][d] == currCost-1 {
				if !visited[pr][pc][d] {
					visited[pr][pc][d] = true
					queue = append(queue, state{pr, pc, d})
				}
			}
		}

		// predecessor by rotation
		for _, pd := range []int{(d + 1) % 4, (d + 3) % 4} {
			if costMap[r][c][pd] == currCost-1000 {
				if !visited[r][c][pd] {
					visited[r][c][pd] = true
					queue = append(queue, state{r, c, pd})
				}
			}
		}
	}

	// Count tiles on best paths
	tileOnPath := make([][]bool, rows)
	for r := 0; r < rows; r++ {
		tileOnPath[r] = make([]bool, cols)
	}

	count := 0
	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if m[r][c] == '#' {
				continue
			}
			for d := 0; d < 4; d++ {
				if visited[r][c][d] {
					tileOnPath[r][c] = true
					break
				}
			}
			if tileOnPath[r][c] {
				count++
			}
		}
	}

	return minCost, count
}

func makeMap(B2 cl.B2) (cl.B2, cl.Vec2, cl.Vec2) {
	g := cl.B2{}
	start, end := cl.V2Zero(), cl.V2Zero()
	for y := 0; y < len(B2); y++ {
		r := []byte{}
		for x := 0; x < len(B2[y]); x++ {
			p := cl.V2(x, y)
			c := B2.V(p)
			r = append(r, c)
			if c == 'S' {
				start = p
			} else if c == 'E' {
				end = p
			}

		}
		g = append(g, r)
	}
	cl.Assert(!start.Equals(cl.V2Zero()))
	cl.Assert(!end.Equals(cl.V2Zero()))
	return g, start, end
}
