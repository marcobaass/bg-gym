'use client'

import BoardRenderer from '@/components/BoardRenderer';
import { Position, Move } from '@/types/board';
import { Color } from '@/types/board';
import { getAvailableMoves, isValidPoint } from '@/utils/move-utils';
import { uiReducer, INITIAL_UI_STATE } from '@/utils/uiReducer';
import React, { useState, useEffect, useReducer } from 'react'
import { compareWithBestMoves } from '@/utils/compareBestMoves-utils';
import ResultsModal from '@/components/ResultsModal';
import clsx from 'clsx';

type Props = {
  positionData: Position | null;
  selectedPoint: number | null;
  availableMoves: number[];
  remainingDice: number[];
  onCheckerClick: (pointIndex: number) => void;
  onDestinationClick: (destinationPoint: number) => void;
  userColor: Color;
}

function pointsFromEquityDiff(bestEquity: number, userEquity: number): number {
  const equityDiff = bestEquity - userEquity;
  if (equityDiff <= 0.02) {
    return 6;
  } else if (equityDiff < 0.08) {
    return 3;
  } else {
    return 1;
  }
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
  const [resultsModal, setShowResultsModal] = useState<boolean>(false)
  const [result, setResult] = useState<Move | undefined>(undefined)

  console.log("Data loaded from localStorage:", positionData);
  
  const userColor = ui.currentPosition?.playerToPlay ?? 'White'
  const [cubeDecision, setCubeDecision] = useState<string | undefined>(undefined)



  // When the Position changes get new "position" from positionData
  useEffect(() => {
    const position = positionData[currentPositionIndex] ?? null
    dispatch({ type: "POSITION_CHANGED", position })
    setShowResultsModal(false)
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
    try {
      const userMoves = ui.moves
      
      const bestMoves = positionData[currentPositionIndex].bestMoves
      
      const comparisonResult = compareWithBestMoves(userMoves, bestMoves, userColor as Color)

      let pointsForMove: number
        if (comparisonResult === undefined) {
          // User's move is not in bestMoves at all → 0 points
          pointsForMove = 0
        } else {
          const bestEquity = bestMoves[0]?.equity ?? 0
          const userEquity = comparisonResult.equity ?? 0
          pointsForMove = pointsFromEquityDiff(bestEquity, userEquity)
        }

      dispatch({ type: "ADD_SCORE", score: pointsForMove })      
      setResult(comparisonResult as Move);
      setShowResultsModal(true);
    } catch (error) {
      console.error('Error in handleSubmitMove:', error);
    }
  }

  const handleSubmitCubeDecision = () => {
    try {
      if (positionData[currentPositionIndex].analysisType !== 'Cube') {
        throw new Error('This is not a cube position');
      }

      const cubeActions = positionData[currentPositionIndex].cubeActions
      const bestCubeAction = cubeActions[0]
      const userCubeAction = cubeActions[1]
      
      if (bestCubeAction.action === 'Double/Take' && userCubeAction.action === 'Double/Take') {
      }
    } catch (error) {
      console.error('Error in handleSubmitCubeDecision:', error);
    }
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

            <div className="flex items-center justify-center gap-2">
              {/* Cube decision buttons */}
              {positionData[currentPositionIndex].analysisType === 'Cube' && (
                <>
                  <button
                    type="button"
                    onClick={() => setCubeDecision('Double/Take')}
                    className={clsx(
                      "mt-4 px-6 py-2 rounded disabled:bg-gray-400",
                      cubeDecision === 'Double/Take'
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    )}
                  >
                    Double/Take
                  </button>
                  <button
                    type="button"
                    onClick={() => setCubeDecision('No Double/Take')}
                    className={clsx(
                      "mt-4 px-6 py-2 rounded disabled:bg-gray-400",
                      cubeDecision === 'No Double/Take'
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    )}
                  >
                    No Double/Take
                  </button>
                  <button
                    type="button"
                    onClick={() => setCubeDecision('Double/Pass')}
                    className={clsx(
                      "mt-4 px-6 py-2 rounded disabled:bg-gray-400",
                      cubeDecision === 'Double/Pass'
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    )}
                  >
                    Double/Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => setCubeDecision('TooGoodToDouble/Pass')}
                    className={clsx(
                      "mt-4 px-6 py-2 rounded disabled:bg-gray-400",
                      cubeDecision === 'TooGoodToDouble/Pass'
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    )}
                  >
                    Too good to Double
                  </button>
                </>
              )}
              {/* Submit button */}
              <button
                onClick={handleSubmitMove}
                disabled={ui.remainingDice.length > 0}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
              >
                Submit Move
              </button>
            </div>


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
      {resultsModal && (
        <ResultsModal
        result={result}
        bestMoves={positionData[currentPositionIndex]?.bestMoves ?? []}
        currentPositionIndex={currentPositionIndex}
        setCurrentPositionIndex={setCurrentPositionIndex}
        positionData={positionData}
        score={ui.score}
        totalScore={ui.totalScore}
        />
      )}
    </>
  )
}
