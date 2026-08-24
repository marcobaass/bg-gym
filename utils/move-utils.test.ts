import { describe, it, expect } from "vitest";
import { getAvailableMoves } from "./move-utils";
import { Position, Point } from "@/types/board";

describe("getAvailableMoves", () => {
  it("returns expected moves for clicked dice", () => {
    const position: Position = {
      analysisType: "",
      analysisEngine: "",
      id: "",
      barWhite: 0,
      barBlack: 0,
      bestMoves: [],
      cubeActions: [],
      diceRoll: 53,
      playerToPlay: "White",
      points: [],
      cubeValue: 0,
      cubeOwner: "none",
      pipCountWhite: 100,
      pipCountBlack: 100,
      scoreWhite: 0,
      scoreBlack: 0,
      crawford: false,
      matchLength: 11,
      whiteOff: 0,
      blackOff: 0,
    };

    const points: Point[] = Array.from({ length: 24 }, (_, index) => ({
      id: index,
      owner: undefined,
      count: 0,
    }));

    position.points = points;

    points[5] = {
      id: 5,
      owner: "White",
      count: 1,
    };

    const result = getAvailableMoves(5, [3], position);

    expect(result).toEqual([2]);
  });
});
