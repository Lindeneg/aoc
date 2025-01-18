package cl

import (
	"bytes"
	"container/heap"
	"fmt"
	"log"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
)

func Assert(c bool) {
	AssertM(c, "assertion failed")
}

func AssertM(c bool, m string, args ...any) {
	if !c {
		log.Fatalf(m, args...)
	}
}

func AssertE[T comparable](a, b T) {
	if a != b {
		log.Fatalf("%v is not equal to %v", a, b)
	}
}

func VerifyNotReached() {
	log.Fatalln("unwanted path reached")
}

type Queue[T any] struct {
	q []T
}

func NewQueue[T any]() *Queue[T] {
	return &Queue[T]{}
}

func (q *Queue[T]) Push(v T) {
	q.q = append(q.q, v)
}

func (q *Queue[T]) Pop() T {
	v := q.q[0]
	q.q = q.q[1:]
	return v
}

func (q *Queue[T]) Empty() bool {
	return len(q.q) == 0
}

type Prio[T comparable] struct {
	q    []T
	less func(a T, b T) bool
}

func NewPrio[T comparable](less func(a T, b T) bool) *Prio[T] {
	p := &Prio[T]{q: make([]T, 0), less: less}
	heap.Init(p)
	return p
}

func (pq *Prio[T]) Add(v T) {
	heap.Push(pq, v)
}

func (pq *Prio[T]) Next() T {
	t := heap.Pop(pq)
	return t.(T)
}

func (pq *Prio[T]) Len() int { return len(pq.q) }

func (pq *Prio[T]) Less(i, j int) bool {
	return pq.less(pq.q[i], pq.q[j])
}

func (pq *Prio[T]) Empty() bool {
	return pq.Len() == 0
}

func (pq *Prio[T]) Swap(i, j int) {
	pq.q[i], pq.q[j] = pq.q[j], pq.q[i]
}

func (pq *Prio[T]) Push(x interface{}) {
	pq.q = append(pq.q, x.(T))
}

func (pq *Prio[T]) Pop() interface{} {
	old := pq.q
	n := len(old)
	x := old[n-1]
	pq.q = old[0 : n-1]
	return x
}

type Seen[T comparable] map[T]bool

func NewSeen[T comparable]() Seen[T] {
	return make(Seen[T])
}

func (s Seen[T]) Add(k T) {
	s[k] = true
}

func (s Seen[T]) Has(k T) bool {
	v, ok := s[k]
	return ok && v
}

func (s Seen[T]) Remove(k T) {
	delete(s, k)
}

func (s Seen[T]) Len() int {
	return len(s)
}

func (s Seen[T]) Sorted(less func(a T, b T) bool) []T {
	keys := make([]T, 0)
	for k, v := range s {
		if v {
			keys = append(keys, k)
		}
	}
	sort.Slice(keys, func(i, j int) bool {
		return less(keys[i], keys[j])
	})
	return keys
}

type Vec2 struct {
	X, Y int
}

func Vec2Less(a Vec2, b Vec2) bool {
	return (a.X + a.Y) < (b.X + b.Y)
}

func V2(x, y int) Vec2 {
	return Vec2{x, y}
}

func V2Zero() Vec2 {
	return Vec2{0, 0}
}

func (v Vec2) Magnitude() int {
	return (v.X * v.X) + (v.Y * v.Y)
}

func (v Vec2) Distance(v2 Vec2) int {
	dv := V2(v2.X-v.X, v2.Y-v.Y)
	return int(math.Sqrt(float64(dv.Magnitude())))
}

func (v Vec2) Add(v2 Vec2) Vec2 {
	return Vec2{v.X + v2.X, v.Y + v2.Y}
}

func (v Vec2) Up() Vec2 {
	return Vec2{v.X, v.Y - 1}
}

func (v Vec2) Down() Vec2 {
	return Vec2{v.X, v.Y + 1}
}

func (v Vec2) Left() Vec2 {
	return Vec2{v.X - 1, v.Y}
}

func (v Vec2) Right() Vec2 {
	return Vec2{v.X + 1, v.Y}
}

func (v Vec2) UpRight() Vec2 {
	return Vec2{v.X + 1, v.Y - 1}
}

func (v Vec2) UpLeft() Vec2 {
	return Vec2{v.X - 1, v.Y - 1}
}

func (v Vec2) DownRight() Vec2 {
	return Vec2{v.X + 1, v.Y + 1}
}

func (v Vec2) DownLeft() Vec2 {
	return Vec2{v.X - 1, v.Y + 1}
}

func (v Vec2) String() string {
	return fmt.Sprintf("(%d,%d)", v.X, v.Y)
}

func (v Vec2) Equals(v2 Vec2) bool {
	return v.X == v2.X && v.Y == v2.Y
}

func (v Vec2) Vec3(n int) Vec3 {
	return Vec3{v.X, v.Y, n}
}

func (v Vec2) Sub(v2 Vec2) Vec2 {
	return Vec2{v.X - v2.X, v.Y - v2.Y}
}

func (v Vec2) Scale(s int) Vec2 {
	return Vec2{v.X * s, v.Y * s}
}

type Vec3 struct {
	X, Y, Z int
}

func V3(x, y, z int) Vec3 {
	return Vec3{x, y, z}
}

func (v Vec3) Vec2() Vec2 {
	return Vec2{v.X, v.Y}
}

func (v Vec3) Copy() Vec3 {
	return Vec3{v.X, v.Y, v.Z}
}

func (v Vec3) Scale(s int) Vec3 {
	return Vec3{v.X * s, v.Y * s, v.Z * s}
}

func (v Vec3) Sub(v2 Vec3) Vec3 {
	return Vec3{v.X - v2.X, v.Y - v2.Y, v.Z - v2.Z}
}

type I2 [][]int
type R2 [][]string
type B2 [][]byte

func (b B2) Print() {
	for _, v := range b {
		fmt.Println(string(v))
	}
	fmt.Println()
}

func (b B2) V(v Vec2) byte {
	if !b.ValidIdx(v) {
		return 0
	}
	return b[v.Y][v.X]
}

func (b B2) S(v Vec2, n byte) {
	b[v.Y][v.X] = n
}

func (b B2) ValidIdx(v Vec2) bool {
	return ValidIndicies(len(b), len(b[0]), v.X, v.Y)
}

func (i I2) Print() {
	out(i)
}

func (i I2) ValidIdx(v Vec2) bool {
	return ValidIndicies(len(i), len(i[0]), v.X, v.Y)
}

func (i I2) V(v Vec2) int {
	return i[v.Y][v.X]
}

func (r R2) Print() {
	out(r)
}

func (r R2) ValidIdx(v Vec2) bool {
	return ValidIndicies(len(r), len(r[0]), v.X, v.Y)
}

func (r R2) V(v Vec2) string {
	if !r.ValidIdx(v) {
		return ""
	}
	return r[v.Y][v.X]
}

type Input struct {
	B  []byte
	B1 [][]byte
	R1 []string
	R2
	I2
}

func NewInput(p string) Input {
	return NewInputEx(p, "\n", false)
}

func NewInputI(p string) Input {
	return NewInputEx(p, "\n", true)
}

func NewInputS(p string) Input {
	return NewInputEx(p, "", false)
}

func NewInputSS(p string) Input {
	return NewInputEx(p, " ", false)
}

func NewInputD(p string) Input {
	return NewInputEx(p, "\n\n", false)
}

func NewInputEx(p string, sep string, i2 bool) Input {
	var a2d Input
	data := ReadFile(p)
	a2d.B = bytes.ReplaceAll(data, []byte{13}, []byte{})
	a2d.B = bytes.TrimSpace(a2d.B)
	ss := strings.TrimSpace(string(a2d.B))
	a2d.R1 = strings.Split(ss, sep)
	a2d.B1 = bytes.Split(a2d.B, []byte(sep))

	a2d.R2 = make([][]string, len(a2d.R1))
	if i2 {
		a2d.I2 = make([][]int, len(a2d.R1))
	}
	for i, v := range a2d.R1 {
		a2d.R2[i] = strings.Split(v, "")
		if i2 {
			a2d.I2[i] = make([]int, len(a2d.R2[i]))
			for j, vv := range a2d.R2[i] {
				n, _ := strconv.Atoi(strings.TrimSpace(vv))
				a2d.I2[i][j] = n
			}
		}
	}
	return a2d
}

func ReadFile(p string) []byte {
	if len(os.Args) > 1 {
		p = filepath.Join(os.Args[1], p)
	}
	data, err := os.ReadFile(p)
	if err != nil {
		panic(err)
	}
	return data
}

func out[T any](r [][]T) {
	for _, v := range r {
		fmt.Println(v)
	}
	fmt.Println()
}

type Ex[T comparable] struct {
	Want T
	Fn   func() T
}

func Puzzle[T comparable](expected ...Ex[T]) {
	Expect("Puzzle ", expected...)
}

func Example[T comparable](expected ...Ex[T]) {
	Expect("Example", expected...)
}

func Expect[T comparable](name string, expected ...Ex[T]) {
	for i, v := range expected {
		ExpectRun(name, i+1, v)
	}
}

func ExpectRun[T comparable](name string, i int, expected Ex[T]) {
	start := time.Now()
	got := expected.Fn()
	end := time.Since(start)
	if got != expected.Want {
		panic(fmt.Sprintf("%s %d failed\nGot : %v\nWant: %v", name, i, got, expected.Want))
	}
	fmt.Printf("%s %d: %v (%s)\n", name, i, got, end.String())
}

func ExpectPeek(b []byte, i int, expected string) bool {
	l := i + len(expected)
	if l >= len(b) {
		return false
	}
	return string(b[i:l]) == expected
}

func ReadUntil(b []byte, i int, t byte, legal string) (string, int) {
	sb := strings.Builder{}
	idx := i
	for b[idx] != t {
		if strings.Contains(legal, string(b[idx])) {
			sb.WriteByte(b[idx])
			idx++
		} else {
			return "", 0
		}
	}
	idx++ // skip t
	return sb.String(), idx - i
}

func ValidIndicies(rows, cols, x, y int) bool {
	return 0 <= x && x < cols && 0 <= y && y < rows
}

func Number(s string) int {
	n, err := strconv.Atoi(strings.TrimSpace(s))
	if err != nil {
		panic(err)
	}
	return n
}

func AbsInt(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func DigitCount(n int) int {
	if n == 0 {
		return 1
	}
	return int(math.Log10(float64(n))) + 1
}

func Factorial(n int) int {
	if n == 0 {
		return 1
	}
	return n * Factorial(n-1)
}

type Djikstrable interface {
	ValidIdx(Vec2) bool
	Edges(Vec2) []Vec2
	Obstacle(Vec2) bool
}

func Djikstra(g Djikstrable, start Vec2, end Vec2) []Vec2 {
	path := []Vec2{}

	dist := make(map[Vec2]int)
	parent := make(map[Vec2]Vec2)
	dist[start] = 0

	q := NewPrio(func(a, b Vec3) bool {
		return a.Z < b.Z
	})
	q.Push((start.Vec3(0)))

	for !q.Empty() {
		cur := q.Next()
		pos, weight := cur.Vec2(), cur.Z
		if pos.Equals(end) {
			curr := end
			for curr != start {
				path = append(path, curr)
				curr = parent[curr]
			}
			return path
		}

		for _, dir := range g.Edges(pos) {
			edge := pos.Add(dir)
			if !g.ValidIdx(edge) {
				continue
			}
			if found := g.Obstacle(edge); found {
				continue
			}
			newCost := weight + 1
			if d, ok := dist[edge]; !ok || newCost < d {
				dist[edge] = newCost
				parent[edge] = pos
				q.Add(edge.Vec3(newCost))
			}
		}
	}
	return path
}
