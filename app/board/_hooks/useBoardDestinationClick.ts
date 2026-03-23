'use client'

import type { Dispatch } from "react";
import type { uiReducer } from "@/utils/uiReducer";

type UiState = Parameters<typeof uiReducer>[0];
type UiAction = Parameters<typeof uiReducer>[1];

export default function useBoardDestinationClick({
    ui,
    dispatch,
}: {
    ui: UiState;
    dispatch: Dispatch<UiAction>;
}) {
    const handleDestinationClick = (destinationPoint: number) => {
        if (ui.selectedPoint === null || !ui.currentPosition) return
        // distance different when from bar
        let distance = 0
        if (ui.selectedPoint === -1) {
          distance = 24 - destinationPoint
        } else if (ui.selectedPoint === -2) {
          distance = destinationPoint + 1
        } else {
          distance = Math.abs(destinationPoint - ui.selectedPoint)
        }
        // find used die in array
        const dieIndex = ui.remainingDice.findIndex((die) => die === distance)
        // new Array with unused dies before and after used one
        const newDice = [
          ...ui.remainingDice.slice(0, dieIndex),
          ...ui.remainingDice.slice(dieIndex + 1),
        ]
        dispatch({ type: 'SET_DICE', dice: newDice })
        dispatch({ type: 'MOVE_CHECKER', from: ui.selectedPoint, to: destinationPoint })
        // Clear selection + moves
        dispatch({ type: 'SELECT_POINT', point: null })
        dispatch({ type: 'SET_MOVES', moves: [] })
      }
      return { handleDestinationClick }
}