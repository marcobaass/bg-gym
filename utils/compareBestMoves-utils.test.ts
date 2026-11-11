import { describe, it, expect } from "vitest";
import { compareWithBestMoves } from "./compareBestMoves-utils";


describe("compareWithBestMoves", () => {
  it("matches a move played in natural order (13/8 8/4* → 13/4", () => {
    const userMoves = [
      { from: 7, to: 3, hit: true},
      { from: 12, to: 7, hit: false}
    ]

    const bestMoves = [{ rank: 1, move: [[13,4]] }];

    const userColor = "White"

    const result = compareWithBestMoves(userMoves, bestMoves, userColor)

    expect(result?.rank).toBe(1)
  });
});

describe("compareWithBestMoves", () => {
  it("matches a move played in reverse order (8/4* 13/8 → 13/4*)", () => {
    const userMoves = [
      { from: 12, to: 7, hit: false},
      { from: 7, to: 3, hit: true}
    ]

    const bestMoves = [{ rank: 1, move: [[13,4]] }];

    const userColor = "White"

    const result = compareWithBestMoves(userMoves, bestMoves, userColor)

    expect(result?.rank).toBe(1)
  });
});
