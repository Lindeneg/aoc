package cl

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type Vec2 struct {
	X, Y int
}

func V2(x, y int) Vec2 {
	return Vec2{x, y}
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
		start := time.Now()
		got := v.Fn()
		end := time.Since(start)
		if got != v.Want {
			panic(fmt.Sprintf("%s %d failed\nGot : %v\nWant: %v", name, i+1, got, v.Want))
		}
		fmt.Printf("%s %d: %v (%s)\n", name, i+1, got, end.String())
	}
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

func LeftRightInts(lines []string) ([]int, []int) {
	left := make([]int, 0)
	right := make([]int, 0)
	for _, line := range lines {
		entries := strings.Split(line, " ")
		l := strings.TrimSpace(entries[0])
		r := strings.TrimSpace(entries[len(entries)-1])
		if l == "" || r == "" {
			break
		}
		left = append(left, Number(l))
		right = append(right, Number(r))
	}
	return left, right
}

func RepeatEx(n int, cb func(int) string) string {
	ss := strings.Builder{}
	for i := 0; i < n; i++ {
		ss.WriteString(cb(i))
	}
	return ss.String()
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

func Factorial(n int) int {
	if n == 0 {
		return 1
	}
	return n * Factorial(n-1)
}
