package main

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"strconv"

	"github.com/lindeneg/aoc/cl"
)

const limit = 1<<31 - 1

var (
	target1 = []byte{48, 48, 48, 48, 48}
	target2 = append(target1, 48)
)

// TODO optimize this, runs in about a second..

func main() {
	example := cl.NewInputS("example.in")
	cl.Example(
		cl.Ex[int]{
			Want: 1048970,
			Fn:   func() int { return puzzle(example, false) },
		},
		cl.Ex[int]{
			Want: 5714438,
			Fn:   func() int { return puzzle(example, true) },
		},
	)
	input := cl.NewInput("puzzle.in")
	cl.Puzzle(
		cl.Ex[int]{
			Want: 282749,
			Fn:   func() int { return puzzle(input, false) },
		},
		cl.Ex[int]{
			Want: 9962624,
			Fn:   func() int { return puzzle(input, true) },
		},
	)
}

func puzzle(input cl.Input, part2 bool) int {
	ans := 0
	for ans < limit {
		b := bytes.NewBuffer(input.B)
		b.WriteString(strconv.Itoa(ans))
		h := md5Hash(b.Bytes())
		if hasPrefix(h, part2) {
			break
		}
		ans++
	}
	return ans
}

func hasPrefix(b []byte, part2 bool) bool {
	if part2 && bytes.HasPrefix(b, target2) {
		return true
	}
	if !part2 && bytes.HasPrefix(b, target1) {
		return true
	}
	return false
}

func md5Hash(text []byte) []byte {
	hash := md5.Sum(text)
	dst := make([]byte, hex.EncodedLen(len(hash)))
	hex.Encode(dst, hash[:])
	return dst
}
