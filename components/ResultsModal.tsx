import React, { useState } from 'react'
import { Move, CubeOptionRow, BestCubeAction } from '@/types/board';
import { Position } from '@/types/board';

type Props = {
  result: Move | undefined;
  bestMoves: Move[];
  currentPositionIndex: number;
  setCurrentPositionIndex: (index: number) => void;
  positionData: Position[];
  score: number;
  totalScore: number;
  cubeOptions?: CubeOptionRow[];
  cubePoints?: number;
  setCubeOptions: (options: CubeOptionRow[]) => void;
  setCubePoints: (points: number) => void;
}

function getMistakeColor(equityDiff: number): string {
  
  if (equityDiff <= 0.02) {
    return 'green';
  } else if (equityDiff < 0.08) {
    return 'yellow';
  } else {
    return 'red';
  }
}

export default function ResultsModal({
  result,
  bestMoves,
  currentPositionIndex,
  setCurrentPositionIndex,
  positionData,
  score,
  totalScore,
  cubeOptions,
  cubePoints,
}: Props) {

  const bestEntry = positionData[currentPositionIndex].cubeActions.find(
    (a): a is BestCubeAction => 'bestAction' in a
  );
  const bestActionText = bestEntry?.bestAction;

  return (
    <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center">
        <div className="bg-white/25 backdrop-blur-sm p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Results</h2>
            {cubeOptions && cubeOptions.length > 0
            ? cubeOptions.map(opt => {
              return (
                <li
                  key={opt.rank}
                  className="flex gap-3 rounded-md p-0.5"
                  style={{backgroundColor: opt.isUserOption ? getMistakeColor(opt.equityDiff) : undefined                    
                  }}
                >
                  <p>{opt.label}</p>
                  <p>{(opt.equityDiff).toFixed(3)}</p>
                </li>
              );
            })
          : bestMoves.map(bestMove => {
              const isUserMove = bestMove.rank === result?.rank;
              const equityDiff = bestMoves[0].equity -bestMove.equity;
              return (
                  <li key={bestMove.rank} className="flex gap-3 rounded-md p-0.5" style={{backgroundColor: isUserMove ? getMistakeColor(equityDiff) : undefined}}>
                      <p>{bestMove.rank}.</p>
                      {bestMove.move.map(move => {
                          const from = move[0] < 0 ? 'Bar' : move[0];
                          const to = move[1];
                          return `${from}/${to}`;
                      }).join(', ')}
                      <p>{(bestMove.equity - bestMoves[0].equity).toFixed(3)}</p>
                  </li>
              )
          })}

          {bestActionText && <p>Best Choice: {bestActionText}</p>}

          <div>
            <h3>Points: {cubeOptions && cubeOptions.length > 0 ? cubePoints : score}</h3>
            <h3>Score: {totalScore}</h3>
            <button
              onClick={() => {
                setCurrentPositionIndex(Math.min(positionData.length - 1, currentPositionIndex + 1))
              }}
              disabled={currentPositionIndex === positionData.length - 1}
              className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400"
            
            >
              Next
            </button>
          </div>
        </div>
    </div>
  )
}