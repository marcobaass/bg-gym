"use client";

import type { Dispatch } from "react";
import type { MoveHistoryEntry, uiReducer } from "@/utils/uiReducer";
import { getDieUsedForBearOff } from "@/utils/move-utils";

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
    if (ui.selectedPoint === null || !ui.currentPosition) return;

    // Check for bear off
    const playerColor = ui.currentPosition.playerToPlay;
    const isBearOff =
      (playerColor === "White" && destinationPoint === -1) ||
      (playerColor === "Black" && destinationPoint === 24);

    if (isBearOff) {
      const dieUsedForBearOff = getDieUsedForBearOff(
        ui.selectedPoint,
        ui.remainingDice,
        ui.currentPosition,
      );
      if (dieUsedForBearOff === null) return;
      const dieIndex = ui.remainingDice.indexOf(dieUsedForBearOff);
      if (dieIndex === -1) return;
      const newDice = [
        ...ui.remainingDice.slice(0, dieIndex),
        ...ui.remainingDice.slice(dieIndex + 1),
      ];
      const historyEntry: MoveHistoryEntry = {
        prevCurrentPosition: ui.currentPosition,
        prevRemainingDice: ui.remainingDice,
        prevSelectedPoint: ui.selectedPoint,
        prevAvailableMoves: ui.availableMoves,
        prevMoves: ui.moves,
      };
      dispatch({
        type: "APPLY_MOVE",
        from: ui.selectedPoint,
        to: destinationPoint,
        newDice: newDice,
        historyEntry: historyEntry,
      });
      return;
    }

    // distance different when from bar
    let distance = 0;
    if (ui.selectedPoint === -1) {
      distance = 24 - destinationPoint;
    } else if (ui.selectedPoint === -2) {
      distance = destinationPoint + 1;
    } else {
      distance = Math.abs(destinationPoint - ui.selectedPoint);
    }
    // find used die in array
    const dieIndex = ui.remainingDice.findIndex((die) => die === distance);
    if (dieIndex === -1) return;
    // new Array with unused dies before and after used one
    const newDice = [
      ...ui.remainingDice.slice(0, dieIndex),
      ...ui.remainingDice.slice(dieIndex + 1),
    ];
    const historyEntry: MoveHistoryEntry = {
      prevCurrentPosition: ui.currentPosition,
      prevRemainingDice: ui.remainingDice,
      prevSelectedPoint: ui.selectedPoint,
      prevAvailableMoves: ui.availableMoves,
      prevMoves: ui.moves,
    };
    dispatch({
      type: "APPLY_MOVE",
      from: ui.selectedPoint,
      to: destinationPoint,
      newDice: newDice,
      historyEntry: historyEntry,
    });
  };
  return { handleDestinationClick };
}
