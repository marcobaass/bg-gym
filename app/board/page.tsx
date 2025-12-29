'use client'

import BoardRenderer from '@/components/BoardRenderer';
import { Position } from '@/types/board';
import { getAvailableMoves, isValidPoint } from '@/utils/move-utils';
import React, { useState, useEffect } from 'react'

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

  console.log("Data loaded from localStorage:", positionData);

  const [currentPositionIndex, setCurrentPositionIndex] = useState(0)

  //Game state
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null)
  const [availableMoves, setAvailableMoves] = useState<number[]>([])
  const [remainingDice, setRemainingDice] = useState<number[]>([])

// When the Position changes get new "position" from positionData
  useEffect(() => {
    if (positionData.length > 0) {
      const position = positionData[currentPositionIndex]

      let newDice: number[] = []
      if (position.diceRoll) {
        const dice1 = Math.floor(position.diceRoll / 10)
        const dice2 = position.diceRoll % 10

        // Handle doubles (e.g., "33" gives [3,3,3,3])
        if (dice1 === dice2) {
          newDice = ([dice1, dice1, dice1, dice1])
        } else {
          newDice = [dice1, dice2]
        }
      }

      setCurrentPosition(position)
      setSelectedPoint(null)
      setAvailableMoves([])
      setRemainingDice(newDice)
    }
  }, [currentPositionIndex, positionData])

  const handleCheckerClick = (pointIndex: number) => {
    console.log(`Clicked checker on point ${pointIndex + 1}`)

    // Check if point is clickable
    if (!isValidPoint(currentPosition, pointIndex, remainingDice)) {
      console.log('Point is not clickable');
      return
    }

    // Set selected point
    setSelectedPoint(pointIndex)

    // Calculate and set available moves
    if (currentPosition) {
      const moves = getAvailableMoves(pointIndex, remainingDice, currentPosition)
      setAvailableMoves(moves)
      console.log('Available moves:', moves)
    }
  }

  const handleDestinationClick = (destinationPoint: number) => {
    if (selectedPoint === null || !currentPosition) return

    console.log(`Moving from ${selectedPoint} to ${destinationPoint}`)

    // TODO: Execute the move (Step 7)

    // Clear selection
    setSelectedPoint(null)
    setAvailableMoves([])
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
              disabled={remainingDice.length > 0}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
            >
              Submit Move
            </button>


          </div>

          <BoardRenderer
            positionData={currentPosition}
            selectedPoint={selectedPoint}
            availableMoves={availableMoves}
            remainingDice={remainingDice}
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
