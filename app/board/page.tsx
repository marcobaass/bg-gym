'use client'

import BoardRenderer from '@/components/BoardRenderer';
import { Position, Move, CubeDecision, CubeOptionRow, CubeActions, BestCubeAction, ParsedCubeDecisionSummary, CubeAction, ParsedCubeDecisionOption } from '@/types/board';
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
  const equityDiff = Math.abs(bestEquity - userEquity);

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
  const [cubeDecision, setCubeDecision] = useState<CubeDecision | null>(null);

  const current = positionData[currentPositionIndex] ?? null
  const isRedouble = current ? current.cubeOwner !== 'none' : false

  const cubeDecisions: CubeDecision[] = [
    'No Double',
    'Double/Take',
    'Double/Pass',
    'Too good to double'
  ];

  const [cubeOptions, setCubeOptions] = useState<CubeOptionRow[]>([])
  const [cubePoints, setCubePoints] = useState<number>(0)

  function getCubeButtonLabel(decision: CubeDecision, isRedouble: boolean):string {
    const prefix = isRedouble ? 'Re' : ''

    switch (decision) {
      case 'No Double':
        return isRedouble ? 'No redouble' : 'No double';
      case 'Double/Take':
        return `${prefix}double/Take`;      // "Double/Take" or "Redouble/Take"
      case 'Double/Pass':
        return `${prefix}double/Pass`;      // "Double/Pass" or "Redouble/Pass"
      case 'Too good to double':
        return isRedouble ? 'Too good to redouble' : 'Too good to double';
    }
  }

  function normalizeAction(label: string): CubeDecision | null {
    const lower = label.toLowerCase();

    if (lower === 'no double' || lower === 'no redouble') return 'No Double';
    if (lower === 'double/take' || lower === 'redouble/take') return 'Double/Take';
    if (lower === 'double/pass' || lower === 'redouble/pass') return 'Double/Pass';

    return null;
  }

  function buildCubeDecisionsSummary(
    cubeActions: (CubeActions | BestCubeAction)[],
  ): ParsedCubeDecisionSummary | null {
    const numeric = cubeActions.filter(
      (item): item is CubeActions => 'action' in item
    );
    
    const best = cubeActions.find(
      (item): item is BestCubeAction => 'bestAction' in item
    );

    if (!best) {
      console.warn('No BestCubeAction found in cubeActions', cubeActions);
      return null;
    }

    const maybeOptions = numeric.map((num) => {
      const decision = normalizeAction(num.action);
      if (!decision) {
        return null;
      }
      return {
        decision: decision,
        equity: num.equity,
      }
    })
    const options = maybeOptions.filter(
      (opt): opt is ParsedCubeDecisionOption => opt !== null
    )

    const bestLower = best.bestAction.toLowerCase();
    // normalize variants like "double / pass" -> "double/pass"
    const normalizedBestLower = bestLower.replace(/\s*\/\s*/g, '/');
    let bestDecision: CubeDecision | null = null;

    console.log('bestLower', bestLower);
    console.log('best.bestAction', best.bestAction);

    if (normalizedBestLower.startsWith('too good')) {
      bestDecision = 'Too good to double';      
    } else if (normalizedBestLower.includes('no double') || normalizedBestLower.includes('no redouble')) {
      bestDecision = 'No Double';
    } else if (normalizedBestLower.includes('double/take') || normalizedBestLower.includes('redouble/take')) {
      bestDecision = 'Double/Take';
    } else if (normalizedBestLower.includes('double/pass') || normalizedBestLower.includes('redouble/pass')) {
      bestDecision = 'Double/Pass';
    }

    if (!bestDecision) {
      console.warn('No best decision found in cubeActions', cubeActions);
      return null;
    }

    return {
      bestDecision,
      options,
    }
  }
    
  // When the Position changes get new "position" from positionData
  useEffect(() => {
    const position = positionData[currentPositionIndex] ?? null
    dispatch({ type: "POSITION_CHANGED", position })
    setShowResultsModal(false)
    setCubeDecision(null)
    setCubeOptions([])
    setCubePoints(0)
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
    if (positionData[currentPositionIndex].analysisType !== 'Cube') {
      throw new Error('This is not a cube position');
    }

    const cubeActions = positionData[currentPositionIndex].cubeActions;

    const summary = buildCubeDecisionsSummary(cubeActions);

    if (!summary) {
      console.warn('No summary found for cube decisions', cubeActions);
      return;
    }

    if (!cubeDecision) {
      console.warn('No cube decision selected');
      return;
    }

    if (cubeDecision === 'Too good to double' && summary.bestDecision !== 'Too good to double') {
      const pointsForDecision = 1;

      setCubePoints(pointsForDecision);
      dispatch({ type: "ADD_SCORE", score: pointsForDecision });

      console.log('cube summary', summary);
      console.log('cubeDecision', cubeDecision, 'but bestDecision is', summary.bestDecision);
      console.log('pointsForDecision', pointsForDecision);

      return;
    }

    const bestOption = summary.options.find(
      (opt) => opt.decision === summary.bestDecision
    );

    if (!bestOption) {
      console.warn('Best option not found in summary', summary.options);
      return;
    }

    const bestEquity = bestOption.equity;

    const userOption = summary.options.find(opt => opt.decision === cubeDecision);

    if (!userOption) {
      console.warn('User option not found in summary', summary.options);
      return;
    }

    const userEquity = userOption.equity;
    const pointsForDecision = pointsFromEquityDiff(bestEquity, userEquity);

    setCubePoints(pointsForDecision);

    dispatch({ type: "ADD_SCORE", score: pointsForDecision })

    const rows: CubeOptionRow[] = summary.options
      .map((opt, index) => {
        const equityDiff = Math.abs(bestEquity - opt.equity);
        return {
          label: opt.decision,
          equity: opt.equity,
          equityDiff: equityDiff,
          isUserOption: opt.decision === cubeDecision,
        }
      })

    setCubeOptions(rows);
    setShowResultsModal(true);

    console.log('cube summary', summary);
    console.log('bestEquity', bestEquity);
    console.log('userOption', userOption);
    console.log('pointsForDecision', pointsForDecision);
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
                  {cubeDecisions.map((decision) => (
                    <button
                      key={decision}
                      type="button"
                      onClick={() => setCubeDecision(decision)}
                      className={clsx(
                        "mt-4 px-6 py-2 rounded disabled:bg-gray-400",
                        cubeDecision === decision
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      )}
                    >
                      {getCubeButtonLabel(decision, isRedouble)}
                    </button>
                  ))}
                </>
              )}
              
              {/* Submit button */}
              <button
                onClick={current?.analysisType === 'Move' ? handleSubmitMove : handleSubmitCubeDecision}
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
        cubeOptions={cubeOptions}
        setCubeOptions={setCubeOptions}
        cubePoints={cubePoints}
        setCubePoints={setCubePoints}
        />
      )}
    </>
  )
}
