import React from 'react'
import { Move } from '@/types/board';
import { Position } from '@/types/board';

type Props = {
  result: Move | undefined;
  bestMoves: Move[];
}

function getMistakeColor(equityDiff: number): string {
  if (equityDiff <= 0.02) return 'green';
  if (equityDiff <= 0.08) return 'yellow';
  return 'red';
}

export default function ResultsModal({result, bestMoves}: Props) {
  return (
    <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center">
        <div className="bg-white/25 backdrop-blur-sm p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Results</h2>
            {bestMoves.map(bestMove => {
                const isUserMove = bestMove.rank === result?.rank;
                const equityDiff = bestMoves[0].equity -bestMove.equity;
                console.log('equityDiff: ', equityDiff);
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
        </div>
    </div>
  )
}