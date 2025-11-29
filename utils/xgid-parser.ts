import { BoardState } from "@/types/board";
import { Point } from "@/types/board";
import { Color } from "@/types/board";
import { PositionAnalysis } from "@/types/board";

const DEFAULT_ANALYSIS: PositionAnalysis = {
  positionId: '',
  moves: [],
  optimalCubeAction: 'No Double'
}

// Notation for numbers of checkers on a certain position
const ENCODING_MAP: {[key: string]: number} = {
  '-': 0,
  'A': 1,
  'B': 2,
  'C': 3,
  'D': 4,
  'E': 5,
  'F': 6,
  'G': 7,
  'H': 8,
  'I': 9,
  'J': 10,
  'K': 11,
  'L': 12,
  'M': 13,
  'N': 14,
  'O': 15,
}

export function createBoardStateFromXgid(xgid:string): BoardState {
  const xgidParts = xgid.slice(5).split(":");

  /**
   * XGID Array Segments (e.g., ["-a-aaaE...", "0", "0", "-1", "52", ...])
   * [0]: Position Segment (Checker Placement)
   * [1]: Cube Value
   * [2]: Cube Ownership/State
   * [3]: Player to Play (-1=Black, 1=White)
   * [4]: Dice Roll (e.g., "52")
   */

  // Initializing the points array (26 spots: 0-25)
  const points: Point[] = Array.from({ length: 26 }, (_, i) => ({
    id: i,
    owner: undefined,
    count: 0
}));

  // all checker positions
  const positionPart = xgidParts[0]

  let pointIndex = 24;
  let totalWhiteCheckersOnBoard = 0;
    let totalBlackCheckersOnBoard = 0;

    for (const char of positionPart) {
    const charUpper = char.toUpperCase();
    const count = ENCODING_MAP[charUpper] || 0;

    let owner: Color | undefined = undefined;

    if (count > 0 && pointIndex >= 1) {
      if (char >= 'A' && char <= 'Z') {
        owner = 'White';
        totalWhiteCheckersOnBoard += count;
      } else if (char >= 'a' && char <= 'z') {
        owner = 'Black';
        totalBlackCheckersOnBoard += count;
      }
    }

    points[pointIndex].count = count;
    points[pointIndex].owner = owner;

    pointIndex --;


  }

  return {
    points,
    dice: [0, 0],
    playerOnTurn: 'White',
    analysis: DEFAULT_ANALYSIS
  }
}
