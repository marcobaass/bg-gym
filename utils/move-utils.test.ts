import { describe, it, expect } from "vitest";
import { getAvailableMoves, getNumberOfPlayableDice } from "./move-utils";
import { Position, Point } from "@/types/board";

const position: Position = {
  analysisType: "",
  analysisEngine: "",
  id: "",
  barWhite: 0,
  barBlack: 0,
  bestMoves: [],
  cubeActions: [],
  diceRoll: 31,
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

describe("getAvailableMoves", () => {
  it("returns expected moves for clicked dice", () => {
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

describe("getNumberOfPlayableDice", () => {
  it("returns 2 when both dice can be used in sequence", () => {
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

    const result = getNumberOfPlayableDice(position, [3, 1]);
    expect(result).toBe(2);
  });

  it("returns 1 when only one dice can be used in sequence", () => {
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

    points[2] = {
      id: 2,
      owner: "Black",
      count: 2,
    };

    points[1] = {
      id: 1,
      owner: "Black",
      count: 2,
    };

    const result = getNumberOfPlayableDice(position, [3, 1]);
    expect(result).toBe(1);
  });

  it("returns 2 when both dice can be used in different sequences", () => {
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

    points[2] = {
      id: 2,
      owner: "Black",
      count: 2,
    };

    const result = getNumberOfPlayableDice(position, [3, 1]);
    expect(result).toBe(2);
  });

  it("returns 0 when both dice can't be used in any sequences", () => {
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

    points[4] = {
      id: 4,
      owner: "Black",
      count: 2,
    };

    points[2] = {
      id: 2,
      owner: "Black",
      count: 2,
    };

    const result = getNumberOfPlayableDice(position, [3, 1]);
    expect(result).toBe(0);
  });

  it("returns 3 when only 3 dice of a double can be used in any sequences", () => {
    const points: Point[] = Array.from({ length: 24 }, (_, index) => ({
      id: index,
      owner: undefined,
      count: 0,
    }));

    position.points = points;

    points[22] = {
      id: 22,
      owner: "White",
      count: 1,
    };

    points[21] = {
      id: 21,
      owner: "White",
      count: 1,
    };

    points[20] = {
      id: 20,
      owner: "White",
      count: 2,
    };

    points[19] = {
      id: 19,
      owner: "Black",
      count: 2,
    };

    points[15] = {
      id: 15,
      owner: "Black",
      count: 2,
    };

    points[14] = {
      id: 14,
      owner: "Black",
      count: 2,
    };

    const result = getNumberOfPlayableDice(position, [3, 3, 3, 3]);
    expect(result).toBe(3);
  });

  it("returns 1 when only 1 dice  can be used entering from bar in any sequences", () => {
    const points: Point[] = Array.from({ length: 24 }, (_, index) => ({
      id: index,
      owner: undefined,
      count: 0,
    }));

    position.points = points;

    position.barWhite = 1;

    points[23] = {
      id: 19,
      owner: "Black",
      count: 2,
    };

    points[20] = {
      id: 15,
      owner: "Black",
      count: 2,
    };

    const result = getNumberOfPlayableDice(position, [3, 1]);
    expect(result).toBe(1);
  });
});
