export type Color = 'White' | 'Black'

export type CubeAction = 'No Double' | 'Double/Take' | 'Double/Pass' | 'Recube/Take' | 'Recube/Pass' | 'Take' | 'Pass';

export type AnalysisType = 'Move' | 'Cube' | 'Unknown'

export interface Point {
  id: number;
  owner: Color | undefined;
  count: number;
}

export interface AnalyzedMove {
  moveNotation: string;
  equity: number;
  equityLoss: number;
  isOptimal: boolean;
}

export interface PositionAnalysis {
  positionId: string;
  moves: AnalyzedMove[];
  optimalCubeAction: CubeAction;
  analysisType: AnalysisType;
}

export interface BoardState {
  points: Point[];
  dice: [number, number];
  playerOnTurn: Color;
  analysis: PositionAnalysis;
}

export interface Move {
  rank: number;
  move: string;
  equity: number;
}

export interface CubeActions {
  action: string;
  equity: number;
}

export interface BestCubeAction {
  bestAction: string;
}

export interface Position {
  analysisType: string;
  barWhite: number;
  barBlack: number;
  bestMoves: Move[];
  cubeActions: (CubeActions | BestCubeAction) [];
  diceRoll: number;
  playerToPlay: Color;
  points: Point[];
  cubeValue: number;
  cubeOwner: 'White' | 'Black' | 'none';
  pipCountWhite: number;
  pipCountBlack: number;
  scoreWhite: number;
  scoreBlack: number;
  crawford: boolean;
  matchLength: number;
  whiteOff: number;
  blackOff: number;
}
