import { Position } from "@/types/board";
import { applyMove } from "./move-utils";

export function diceFromRoll(diceRoll?: number | null): number[] {
  if (!diceRoll) return [];
  const d1 = Math.floor(diceRoll / 10);
  const d2 = diceRoll % 10;
  return d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];
}

export type Move = {
  from: number;
  to: number;
  hit: boolean;
};

export type UIState = {
  selectedPoint: number | null;
  availableMoves: number[];
  remainingDice: number[];
  currentPosition: Position | null;
  moves: Move[];
  score: number;
  totalScore: number;
  moveHistory: MoveHistoryEntry[];
};

type Action =
  | { type: "POSITION_CHANGED"; position: Position | null }
  | { type: "SELECT_POINT"; point: number | null }
  | { type: "SET_MOVES"; moves: number[] }
  | { type: "SET_DICE"; dice: number[] }
  | { type: "ADD_SCORE"; score: number }
  | {
      type: "APPLY_MOVE";
      from: number;
      to: number;
      newDice: number[];
      historyEntry: MoveHistoryEntry;
    }
  | { type: "UNDO_MOVE" };

/**
 * Constants & Initial State
 */
export const INITIAL_UI_STATE: UIState = {
  selectedPoint: null,
  availableMoves: [],
  remainingDice: [],
  currentPosition: null,
  moves: [],
  score: 0,
  totalScore: 0,
  moveHistory: [],
};

/**
 * Undo State Management
 */
export type MoveHistoryEntry = {
  prevCurrentPosition: Position | null;
  prevRemainingDice: number[];
  prevSelectedPoint: number | null;
  prevAvailableMoves: number[];
  prevMoves: Move[];
};

/**
 * Reducer: Manages the UI interaction state
 */
export function uiReducer(state: UIState, action: Action): UIState {
  switch (action.type) {
    case "POSITION_CHANGED":
      return {
        selectedPoint: null,
        availableMoves: [],
        remainingDice: diceFromRoll(action.position?.diceRoll),
        currentPosition: action.position,
        moves: [],
        score: 0,
        totalScore: state.totalScore,
        moveHistory: [],
      };
    case "SELECT_POINT":
      return { ...state, selectedPoint: action.point };
    case "SET_MOVES":
      return { ...state, availableMoves: action.moves };
    case "SET_DICE":
      return { ...state, remainingDice: action.dice };
    case "ADD_SCORE":
      return {
        ...state,
        score: action.score,
        totalScore: state.totalScore + action.score,
      };

    // Apply a move to the current position
    case "APPLY_MOVE": {
      if (!state.currentPosition) return state;
      let hit = false;
      if (action.to >= 0 && action.to < 24) {
        hit =
          state.currentPosition.points[action.to].count === 1 &&
          state.currentPosition.points[action.to].owner !==
            state.currentPosition.playerToPlay &&
          state.currentPosition.points[action.to].owner !== undefined;
      }
      const updatedPosition = applyMove(
        state.currentPosition,
        action.from,
        action.to,
      );
      return {
        ...state,
        currentPosition: updatedPosition,
        moves: [...state.moves, { from: action.from, to: action.to, hit }],
        moveHistory: [...state.moveHistory, action.historyEntry],
        remainingDice: action.newDice,
        selectedPoint: null,
        availableMoves: [],
      };
    }

    case "UNDO_MOVE": {
      if (state.moveHistory.length === 0) return state;
      const lastMove = state.moveHistory[state.moveHistory.length - 1];
      return {
        ...state,
        currentPosition: lastMove.prevCurrentPosition,
        remainingDice: lastMove.prevRemainingDice,
        selectedPoint: lastMove.prevSelectedPoint,
        availableMoves: lastMove.prevAvailableMoves,
        moves: lastMove.prevMoves,
        moveHistory: state.moveHistory.slice(0, -1),
      };
    }
    default:
      return state;
  }
}
