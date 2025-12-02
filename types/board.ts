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
