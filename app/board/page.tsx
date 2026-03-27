'use client'

import BoardRenderer from '@/components/BoardRenderer';
import { Position, Move, CubeDecision, CubeOptionRow } from '@/types/board';
import { Color } from '@/types/board';
import { getAvailableMoves, isValidPoint } from '@/utils/move-utils';
import { uiReducer, INITIAL_UI_STATE } from '@/utils/uiReducer';
import { useState, useEffect, useReducer } from 'react'
import { compareWithBestMoves } from '@/utils/compareBestMoves-utils';
import ResultsModal from '@/components/ResultsModal';
import { pointsFromEquityDiff } from '@/utils/scoring-utils';
import { buildCubeDecisionsSummary } from '@/utils/cubeDecision-utils';

import useBoardDestinationClick from './_hooks/useBoardDestinationClick';

import PositionHeader from '@/components/board/trainer/PositionHeader';
import NavigationControls from '@/components/board/trainer/NavigationControls';
import CubeDecisionButtons from '@/components/board/trainer/CubeDecisionButtons';
import SubmitButton from '@/components/board/trainer/SubmitButton';
import useBoardSubmitCubeDecision from './_hooks/useBoardSubmitCubeDecision';

const cubeDecisions: CubeDecision[] = [
  'No Double',
  'Double/Take',
  'Double/Pass',
  'Too good to double'
];

export default function Board({}) {

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
  const [cubeDecision, setCubeDecision] = useState<CubeDecision | null>(null);

  const current = positionData[currentPositionIndex] ?? null
  const isRedouble = current ? current.cubeOwner !== 'none' : false

  const [cubeOptions, setCubeOptions] = useState<CubeOptionRow[]>([])
  const [cubePoints, setCubePoints] = useState<number>(0)
    
  // When the Position changes get new "position" from positionData
  useEffect(() => {
    const position = positionData[currentPositionIndex] ?? null
    dispatch({ type: "POSITION_CHANGED", position })
    
  }, [currentPositionIndex, positionData])

  const handlePreviousPosition = () => {
    setShowResultsModal(false)
    setCubeDecision(null)
    setCubeOptions([])
    setCubePoints(0)
    setCurrentPositionIndex(Math.max(0, currentPositionIndex - 1))
  }

  const handleNextPosition = () => {
    setShowResultsModal(false)
    setCubeDecision(null)
    setCubeOptions([])
    setCubePoints(0)
    setCurrentPositionIndex(Math.min(positionData.length - 1, currentPositionIndex + 1))
  }

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

  const { handleDestinationClick } = useBoardDestinationClick({ ui, dispatch })


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

  const { handleSubmitCubeDecision } = useBoardSubmitCubeDecision({
    positionData,
    currentPositionIndex,
    cubeDecision,
    setCubePoints,
    setCubeOptions,
    setShowResultsModal,
    dispatch,
  })

  const isCubePosition = current?.analysisType === 'Cube'

  return (
    <>
      <div className="text-center mb-4 text-2xl font-bold">Welcome to the Training</div>

      {positionData.length > 0 ? (
        <>
          <div className="text-center mb-4">
            <PositionHeader currentPositionIndex={currentPositionIndex} positionData={positionData} />
            <NavigationControls
              onPrevious={handlePreviousPosition}
              onNext={handleNextPosition}
              canGoPrevious={currentPositionIndex > 0}
              canGoNext={currentPositionIndex < positionData.length - 1}
            />
            <div className="flex items-center justify-center gap-2">
              <CubeDecisionButtons
                isCubePosition={isCubePosition}
                cubeDecisions={cubeDecisions}
                setCubeDecision={setCubeDecision}
                cubeDecision={cubeDecision}
                userColor={userColor}
                isRedouble={isRedouble}
              />
              <SubmitButton
                current={current}
                handleSubmitMove={handleSubmitMove}
                handleSubmitCubeDecision={handleSubmitCubeDecision}
                disabled={ui.remainingDice.length > 0}
              />
            </div>

          </div>

          <div className="relative">
            <BoardRenderer
              positionData={ui.currentPosition}
              selectedPoint={ui.selectedPoint}
              availableMoves={ui.availableMoves}
              remainingDice={ui.remainingDice}
              onCheckerClick={handleCheckerClick}
              onDestinationClick={handleDestinationClick}
            />
            {
              current?.analysisType === "Move" && (
                <button
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 enabled:bg-white disabled:bg-gray-300 text-black px-4 py-2 rounded-md border border-black enabled:hover:bg-green-100"
                  onClick={() => dispatch({ type: 'UNDO_MOVE' })}
                  disabled={ui.moveHistory.length === 0}            
                >
                  Undo
                </button>
              )
            }
          </div>



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
        cubeOptions={cubeOptions}
        setCubeOptions={setCubeOptions}
        cubePoints={cubePoints}
        setCubePoints={setCubePoints}
        />
      )}
    </>
  )
}
