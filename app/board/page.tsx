'use client'

import BoardRenderer from '@/components/BoardRenderer';
import { Position, Move, CubeDecision, CubeOptionRow, CategorySession } from '@/types/board';
import { Color } from '@/types/board';
import { getAvailableMoves, isValidPoint } from '@/utils/move-utils';
import { uiReducer, INITIAL_UI_STATE } from '@/utils/uiReducer';
import { useState, useEffect, useReducer } from 'react'
import { compareWithBestMoves } from '@/utils/compareBestMoves-utils';
import ResultsModal from '@/components/ResultsModal';
import { pointsFromEquityDiff } from '@/utils/scoring-utils';
import { loadUserLibrary, saveCategorySession, shufflePositions } from '@/utils/userLibrary';
import { useSearchParams, useRouter } from 'next/navigation';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsCategoryId = searchParams.get('categoryId');
  console.log("Search params categoryId:", searchParamsCategoryId);

  const [positionData] = useState<Position[]>(() => {
    const userLibrary = loadUserLibrary();
    const categoryPositions = userLibrary.library.find((category) => category.category.id === searchParamsCategoryId)?.positions ?? [];
    const shuffled = [...categoryPositions]

    const shuffledPositions = shufflePositions(shuffled);
    return shuffledPositions;
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

  // const handlePreviousPosition = () => {
  //   setShowResultsModal(false)
  //   setCubeDecision(null)
  //   setCubeOptions([])
  //   setCubePoints(0)
  //   setCurrentPositionIndex(Math.max(0, currentPositionIndex - 1))
  // }

  const handleNextPosition = () => {
    setShowResultsModal(false)
    setCubeDecision(null)
    setCubeOptions([])
    setCubePoints(0)
    setCurrentPositionIndex(Math.min(positionData.length - 1, currentPositionIndex + 1))
  }

  const positionsPlayed = positionData.length

  const handleSessionDone = () => {
    setShowResultsModal(false)
    setCubeDecision(null)
    setCubeOptions([])
    setCubePoints(0)
    const categorySession: CategorySession = {
      id: crypto.randomUUID(),
      categoryId: searchParamsCategoryId ?? '',
      finishedAt: Date.now(),
      positionsPlayed: positionsPlayed,
      rawTotalScore: ui.totalScore,
      scorePerPosition: positionsPlayed > 0 ? ui.totalScore / positionData.length : 0,
    }
    if (searchParamsCategoryId) {
      saveCategorySession(categorySession);
    }
    router.push('/')
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
            {/* <NavigationControls
              onPrevious={handlePreviousPosition}
              onNext={handleNextPosition}
              canGoPrevious={currentPositionIndex > 0}
              canGoNext={currentPositionIndex < positionData.length - 1}
            /> */}
            <div className="flex items-center justify-center gap-2">
              <CubeDecisionButtons
                isCubePosition={isCubePosition}
                cubeDecisions={cubeDecisions}
                setCubeDecision={setCubeDecision}
                cubeDecision={cubeDecision}
                userColor={userColor}
                isRedouble={isRedouble}
              />
            </div>

          </div>

          <div className="relative @container">
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
                <div className="absolute inset-0 flex flex-col gap-[1.5cqw] items-center justify-center pointer-events-none">
                  <button
                    className="text-[1.5cqw] px-[1cqw] py-[0.25cqw] rounded-[0.5cqw] border-[0.15cqw] border-black enabled:bg-gray-100 disabled:bg-gray-300 text-black enabled:hover:bg-white pointer-events-auto cursor-pointer"
                    onClick={() => dispatch({ type: 'UNDO_MOVE' })}
                    disabled={ui.moveHistory.length === 0}
                  >
                    ↩
                  </button>
                  <SubmitButton                    
                    current={current}
                    handleSubmitMove={handleSubmitMove}
                    handleSubmitCubeDecision={handleSubmitCubeDecision}
                    disabled={ui.remainingDice.length > 0}
                  />
                </div>
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
        positionData={positionData}
        score={ui.score}
        totalScore={ui.totalScore}
        cubeOptions={cubeOptions}
        cubePoints={cubePoints}
        handleNextPosition={handleNextPosition}
        handleSessionDone={handleSessionDone}
        />
      )}
    </>
  )
}
