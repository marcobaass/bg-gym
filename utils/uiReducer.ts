function diceFromRoll(diceRoll?: number | null): number[] {
  if (!diceRoll) return []
  const d1 = Math.floor(diceRoll / 10)
  const d2 = diceRoll % 10
  return d1 === d2 ? [d1, d1, d1, d1] : [d1, d2]
}

type UIState = {
  selectedPoint: number | null;
  availableMoves: number[];
  remainingDice: number[];
};

type Action =
  | { type: "POSITION_CHANGED"; diceRoll?: number | null }
  | { type: "SELECT_POINT"; point: number | null }
  | { type: "SET_MOVES"; moves: number[] }
  | { type: "SET_DICE"; dice: number[] }

/**
 * Constants & Initial State
 */
export const INITIAL_UI_STATE: UIState = {
  selectedPoint: null,
  availableMoves: [],
  remainingDice: [],
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
        remainingDice: diceFromRoll(action.diceRoll),
      }
    case "SELECT_POINT":
      return { ...state, selectedPoint: action.point }
    case "SET_MOVES":
      return { ...state, availableMoves: action.moves }
    case "SET_DICE":
      return { ...state, remainingDice: action.dice }
    default:
      return state
  }
}
