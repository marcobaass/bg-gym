import { Position, CubeActions, AnalysisType, Point, Color, Move, BestCubeAction } from "@/types/board";

export function createBoardStateFromXgid(positionData:string): Position {

  const analysisType = getAnalysisType(positionData)

  const xgidParts = positionData.slice(5).split(":");

  /**
   * XGID Array Segments (e.g., ["-a-aaaE...", "0", "0", "-1", "52", ...])
   * [0]: Position Segment (Checker Placement) [First Notation = Bar White, 26th Notation = Bar Black]
   * [1]: Cube Value (0 means undoubled)
   * [2]: Cube Ownership/State (0 = none, still in middle)
   * [3]: Player to Play (-1=Black, 1=White)
   * [4]: Dice Roll (e.g., "52")
   * [5]: Off-Board Checkers White
   * [6]: Off-Board Checkers Black
   * [7]: Match Score White
   * [8]: Match Score Black
   * [9]: Match Length
   */

  // Initializing the points array (0: White on Bar, 1-24: Checker Positions, 25: Black on Bar)
  const points: Point[] = Array.from({ length: 26 }, (_, i) => ({
    id: i,
    owner: undefined,
    count: 0
  }));

  const positionPart = xgidParts[0]
  let pointIndex = 24

  for (let i = 0; i < positionPart.length && i < 26; i++) {
    const char = positionPart[i];
    const charUpper = char.toUpperCase();
    const count = ENCODING_MAP[charUpper] || 0;

    // Determine owner based on case
    // Lowercase = Black (O), Uppercase = White (X)
    let owner: Color | undefined = undefined;
    if (count > 0) {
      owner = char === charUpper ? 'White' : 'Black';
    }

    if (i === 0) {
      // First character is White's bar (point 0)
      points[0].count = count;
      points[0].owner = owner;
    } else if (i === 25) {
      // 26th character is Black's bar (point 25)
      points[25].count = count;
      points[25].owner = owner;
    } else {
      // Characters 1-24 are the board points (24 down to 1)
      points[pointIndex].count = count;
      points[pointIndex].owner = owner;
      pointIndex--;
    }
  }

  // Extracting values

  const barWhite = points[0].count

  const barBlack = points[25].count
  const boardPoints = points.slice(1, 25)
  const cubeValue = 1 << +xgidParts[1]
  const cubeOwner = ['Black', 'none', 'White'][parseInt(xgidParts[2]) + 1] as 'Black' | 'none' | 'White';

  // Pip count
  let pipCountWhite = 0
  let pipCountBlack = 0
  const pipMatch = positionData.match(/Pip count\s+X:\s*(\d+)\s+O:\s*(\d+)/);
  if (pipMatch) {
    pipCountWhite = parseInt(pipMatch[1])
    pipCountBlack = parseInt(pipMatch[2])
  }

  // Best moves or cube actions by equity
  let bestMoves: Move[] = []
  if (analysisType==='Move') {
    bestMoves = moveAnalysis(positionData)
  }

  let cubeActions: (CubeActions | BestCubeAction)[] = []
  if (analysisType==='Cube') {
    cubeActions = cubeAnalysis(positionData)
  }

  // Constructing Position Object
  const position: Position = {
    analysisType,
    barWhite,
    barBlack,
    bestMoves,
    cubeActions,
    points: boardPoints,
    cubeValue,
    cubeOwner,
    pipCountWhite,
    pipCountBlack
  }

  console.log('Position', position);

  return position as Position
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

// Determine weather it's move or cube analysis
function getAnalysisType(xgid: string): AnalysisType {

  // Checking for cube decision signatures (CR:Take, CR:Pass)
  if (xgid.includes("cube action")) {
    return 'Cube';
  }

  // Checking for move signatures
  if (xgid.includes("to play")) {
    return 'Move';
  }

  return 'Unknown'
}






function moveAnalysis(xgid: string): Move[] {

  const regex = /^\s*(\d+)\.\s+.*?\s+([\d\/\s\*]+)\s+eq:([+\-]?\d+,\d+)/gm;

  const bestMoves: Move[] = [];
  let match;

  while ((match = regex.exec(xgid)) !== null) {
    bestMoves.push({
      rank: parseInt(match[1]),
      move: match[2].trim(),
      equity: parseFloat(match[3].replace(',', '.'))
    });
  }

  return bestMoves
}



function cubeAnalysis(xgid: string): (CubeActions | BestCubeAction)[] {
  const cubeActionsRegex = /^\s*(No redouble|Redouble\/Take|Redouble\/Pass|Double\/Take|Double\/Pass):\s*([+\-]?\d+,\d+)/gmi;
  const cubeActions: (CubeActions | BestCubeAction)[] = [];

  let match;
  while ((match = cubeActionsRegex.exec(xgid)) !== null) {
    cubeActions.push({
      action: match[1],
      equity: parseFloat(match[2].replace(',', '.'))
    });
  }

  const bestCubeRegex = /Best Cube action:\s*(.+)/i;
  const bestMatch = xgid.match(bestCubeRegex);

  if (bestMatch) {
    cubeActions.push({
      bestAction: bestMatch[1].trim()
    });
  }

  return cubeActions;
}
