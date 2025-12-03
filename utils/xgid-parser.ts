import { BoardState, CubeAction, AnalysisType, AnalyzedMove, PositionAnalysis, Point, Color } from "@/types/board";

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

function getAnalysisType(xgid: string): AnalysisType {
  // Checking for cube decision signatures (CR:Take, CR:Pass)
  if (xgid.includes("CR:Take") || xgid.includes("CR:Pass")) {
    return 'Cube';
  }

  // Checking for move signatures
  if (xgid.includes("XG Roller++")) {
    return 'Move';
  }

  return 'Unknown'
}

function parseAnalysis(xgid: string, positionId: string): PositionAnalysis {
  // Determine Cube or Move Analysis
  const type = getAnalysisType(xgid);

  const positionPartIndex = xgid.indexOf(positionId);
  const rawAnalysis = xgid.substring(positionPartIndex + positionId.length).trim();

  let optimalCubeAction: CubeAction = 'No Double';
  const bestMoves: AnalyzedMove[] = []

  const CUBE_ACTION_REGEX = /CR:(\w+\s?\w+)/;
  let cubeActionMatch = rawAnalysis.match(CUBE_ACTION_REGEX);

  if (cubeActionMatch && cubeActionMatch[1]) {
    optimalCubeAction = cubeActionMatch[1].trim() as CubeAction;
  } else {
    const BEST_CUBE_ACTION_REGEX = /\s*Best\ Cube\ action:\s*([\w\s\/]+)/;
    cubeActionMatch = rawAnalysis.match(BEST_CUBE_ACTION_REGEX);

    if (cubeActionMatch && cubeActionMatch[1]) {
      let actionString = cubeActionMatch[1].trim();
      actionString = actionString.replace(/\s\/\s/g, '/');
      optimalCubeAction = actionString as CubeAction;
    }
  }

  //Use the FULL_MOVE_REGEX pattern to capture Move Notation (Group 1), Equity (Group 2), and Equity Loss (Group 4—optional, nested).
  const FULL_MOVE_REGEX = /\s*\d+\.\s+XG\s+Roller\+\+\s+([\w\s\/\*\(\)\-\s]+)\s+eq:([+\-]\d+,\d+)\s*(\(([\+\-]\d+,\d+)\))?/g;

  let moveMatch
  let isFirstMove = true;

  while ((moveMatch = FULL_MOVE_REGEX.exec(rawAnalysis)) !==null) {
    const moveNotation = moveMatch[1].trim();
    const equityString = moveMatch[2].replace(",", ".");
    const equity = parseFloat(equityString)

    let equityLoss = 0

    if (!isFirstMove && moveMatch[4]) {
      const lossString = moveMatch[4].replace(",", ".");
      equityLoss = Math.abs(parseFloat(lossString));
    }

    const move: AnalyzedMove = {
      moveNotation,
      equity,
      equityLoss,
      isOptimal: isFirstMove
    }

    bestMoves.push(move)

    isFirstMove = false

  }


  return {
        positionId: positionId,
        moves: bestMoves,
        optimalCubeAction: optimalCubeAction,
        analysisType: type
  };


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
  const dicePart: [number, number] = xgidParts[4].split("").map(numb => parseInt(numb, 10)) as [number, number]
  const playerOnTurn = parseInt(xgidParts[3], 10) > 0 ? 'White' : 'Black'

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

  points[0].owner = 'White'
  points[0].count = 15 - totalWhiteCheckersOnBoard

  points[25].owner = 'Black'
  points[25].count = 15 - totalBlackCheckersOnBoard

  return {
    points,
    dice: dicePart,
    playerOnTurn: playerOnTurn,
    analysis: parseAnalysis(xgid, positionPart)
  }
}
