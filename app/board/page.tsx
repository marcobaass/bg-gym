'use client'

import BoardRenderer from '@/components/BoardRenderer';
import { Position } from '@/types/board';
import { getAvailableMoves, isValidPoint } from '@/utils/move-utils';
import { uiReducer, INITIAL_UI_STATE } from '@/utils/uiReducer';
import React, { useState, useEffect, useReducer } from 'react'

type Props = {
  positionData: Position | null;
  selectedPoint: number | null;
  availableMoves: number[];
  remainingDice: number[];
  onCheckerClick: (pointIndex: number) => void;
  onDestinationClick: (destinationPoint: number) => void;
}

export default function Board({}: Props) {

  const [positionData] = useState<Position[]>(() => {
    try {
      const showListString = localStorage.getItem("showList");
      if (showListString) {
        const parsedData: Position[] = JSON.parse(showListString)
        return parsedData
      } else {
        console.log("No 'showList' data found in localStorage.");
        return []
      }
    } catch(error) {
      console.error("Error accessing or parsing localStorage data:", error);
      return []
    }
  });

  const [currentPositionIndex, setCurrentPositionIndex] = useState(0)
  const [ui, dispatch] = useReducer(uiReducer, INITIAL_UI_STATE)

  console.log("Data loaded from localStorage:", positionData);


  // When the Position changes get new "position" from positionData
  useEffect(() => {
    const position = positionData[currentPositionIndex] ?? null
    dispatch({ type: "POSITION_CHANGED", position })
  }, [currentPositionIndex, positionData])



  const handleCheckerClick = (pointIndex: number) => {
    console.log(`Clicked checker on point ${pointIndex + 1}`)

    // Check if point is clickable
    if (!isValidPoint(ui.currentPosition, pointIndex, ui.remainingDice)) {
      console.log('Point is not clickable');
      return
    }

    // Set selected point
    dispatch({type: 'SELECT_POINT', point: pointIndex})

    // Calculate and set available moves
    if (ui.currentPosition) {
      const moves = getAvailableMoves(pointIndex, ui.remainingDice, ui.currentPosition)
      dispatch({type: 'SET_MOVES', moves})
    }
  }



  const handleDestinationClick = (destinationPoint: number) => {
    if (ui.selectedPoint === null || !ui.currentPosition) return

    // distance diffrent when from bar
    let distance = 0
    if (ui.selectedPoint === -1) {
      distance = 24 - destinationPoint
    } else if (ui.selectedPoint === -2) {
      distance = destinationPoint + 1
    } else {
      distance = Math.abs(destinationPoint - ui.selectedPoint)
    }

    console.log("ui.selectedPoint: ", ui.selectedPoint);
    console.log("distance: ", distance);


    // find used die in array
    const dieIndex = ui.remainingDice.findIndex(die => die === distance)

    // new Array with unused dies before and after used one
    const newDice = [
      ...ui.remainingDice.slice(0, dieIndex),
      ...ui.remainingDice.slice(dieIndex + 1)
    ]

    dispatch({ type: 'SET_DICE', dice: newDice})

    // Move the checker
    console.log(destinationPoint);

    dispatch({ type: 'MOVE_CHECKER', from: ui.selectedPoint, to: destinationPoint })

    // Clear selection
    dispatch( {type: 'SELECT_POINT', point: null})
    dispatch({type: 'SET_MOVES', moves: []})
  }



  const handleSubmitMove = () => {
    console.log('Submitting move for analysis')
    // TODO: Compare with best moves (Step 4)
  }



  return (
    <>
      <div>Welcome to the Training</div>

      {positionData.length > 0 ? (
        <>
          <div className="text-center mb-4">
            <div className="text-lg font-semibold mb-2">
              Position {currentPositionIndex + 1} of {positionData.length}
            </div>

            {/* Navigation */}
            <div className="space-x-2 mt-2">
              <button
                onClick={() => setCurrentPositionIndex(Math.max(0, currentPositionIndex - 1))}
                disabled={currentPositionIndex === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPositionIndex(Math.min(positionData.length - 1, currentPositionIndex + 1))}
                disabled={currentPositionIndex === positionData.length - 1}
                className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400"
              >
                Next
              </button>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmitMove}
              disabled={ui.remainingDice.length > 0}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
            >
              Submit Move
            </button>


          </div>

          <BoardRenderer
            positionData={ui.currentPosition}
            selectedPoint={ui.selectedPoint}
            availableMoves={ui.availableMoves}
            remainingDice={ui.remainingDice}
            onCheckerClick={handleCheckerClick}
            onDestinationClick={handleDestinationClick}
          />
        </>
      ) : (
        <div>No positions available</div>
      )}
    </>
  )
}
