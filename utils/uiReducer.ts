import { Position } from '@/types/board';

function diceFromRoll(diceRoll?: number | null): number[] {
  if (!diceRoll) return []
  const d1 = Math.floor(diceRoll / 10)
  const d2 = diceRoll % 10
  return d1 === d2 ? [d1, d1, d1, d1] : [d1, d2]
}

export type Move = {
  from: number;
  to: number;
}

type UIState = {
  selectedPoint: number | null;
  availableMoves: number[];
  remainingDice: number[];
  currentPosition: Position | null;
  moves: Move[];
};

type Action =
  | { type: "POSITION_CHANGED"; position: Position | null }
  | { type: "SELECT_POINT"; point: number | null }
  | { type: "SET_MOVES"; moves: number[] }
  | { type: "SET_DICE"; dice: number[] }
  | { type: "MOVE_CHECKER"; from: number; to: number }

/**
 * Constants & Initial State
 */
export const INITIAL_UI_STATE: UIState = {
  selectedPoint: null,
  availableMoves: [],
  remainingDice: [],
  currentPosition: null,
  moves: [],
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
      }
    case "SELECT_POINT":
      return { ...state, selectedPoint: action.point }
    case "SET_MOVES":
      return { ...state, availableMoves: action.moves }
    case "SET_DICE":
      return { ...state, remainingDice: action.dice }
    case "MOVE_CHECKER":
      if (!state.currentPosition) return state

      const updatedPosition = { ...state.currentPosition }

      // Get the owner based on whose turn it is
      const checkerOwner = updatedPosition.playerToPlay

      // Check if bearing off
      if (action.to >= 24) {
        updatedPosition.blackOff += 1
      } else if (action.to < 0) {
        updatedPosition.whiteOff += 1
      }

      // Check if moving from bar
      if (action.from === -1) {
        // Moving white checker from bar
        updatedPosition.barWhite -= 1
      } else if (action.from === -2) {
        // Moving black checker from bar
        updatedPosition.barBlack -= 1
      } else {
        // Moving from regular point - update points array
        updatedPosition.points = updatedPosition.points.map((point, index) => {
          if (index === action.from) {
            const newCount = point.count - 1
            return {
              ...point,
              count: newCount,
              owner: newCount === 0 ? undefined : point.owner
            }
          }
          return point
        })
      }

      // Add to destination if it's a regular point (not bearing off)
      if (action.to >= 0 && action.to < 24) {
        updatedPosition.points = updatedPosition.points.map((point, index) => {
          if (index === action.to) {
            return {
              ...point,
              count: point.count + 1,
              owner: checkerOwner
            }
          }
          return point
        })
      }

      return {
        ...state,
        currentPosition: updatedPosition,
        moves: [...state.moves, { from: action.from, to: action.to }]
      }
    default:
      return state
  }
}
