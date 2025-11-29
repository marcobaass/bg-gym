export type Color = 'White' | 'Black'

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
  optimalCubeAction: string;
}

export interface BoardState {
  points: Point[];
  dice: [number, number];
  playerOnTurn: Color;
  analysis: PositionAnalysis;
}
