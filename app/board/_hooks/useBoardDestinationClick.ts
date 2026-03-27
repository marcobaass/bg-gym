'use client'

import type { Dispatch } from "react";
import type { MoveHistoryEntry, uiReducer } from "@/utils/uiReducer";

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
        const historyEntry: MoveHistoryEntry = {
          prevCurrentPosition: ui.currentPosition,
          prevRemainingDice: ui.remainingDice,
          prevSelectedPoint: ui.selectedPoint,
          prevAvailableMoves: ui.availableMoves,
          prevMoves: ui.moves,
        }
        dispatch({ type: 'APPLY_MOVE', from: ui.selectedPoint, to: destinationPoint, newDice: newDice, historyEntry: historyEntry })
      }
      return { handleDestinationClick }
}