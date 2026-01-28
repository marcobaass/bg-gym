import { Color } from "@/types/board";

type UserMove = {from: number, to: number}
type BestMove = {rank: number, move: number[][]; equity?: number}

export function compareWithBestMoves(userMoves: UserMove[], bestMoves: BestMove[], userColor: Color): BestMove | undefined {
    const normalizedUserMoves = normalizeUserMoves(userMoves);
    const normalizedBestMoves = normalizeBestMoves(bestMoves, userColor);
    const foundMatch = normalizedBestMoves.find(move => areMovesSame(normalizedUserMoves, move.move))
    console.log('match', foundMatch)
    return foundMatch;
}


// Helpers
function normalizeUserMoves(userMoves: UserMove[]): number[][] {
    const journeys: { start: number, current: number}[] = [];

    for (const move of userMoves) {
        const journeyIndex = journeys.findIndex(journey => journey.current === move.from);

        if (journeyIndex !== -1) {
            // Continue existing journey
            journeys[journeyIndex].current = move.to;
        } else {
            // Start new journey
            journeys.push({ start: move.from, current: move.to });
        }
    }

    // Return as [start, end] pairs
    return journeys.map(j => [j.start, j.current]);
}

function normalizeBestMoves(bestMoves: BestMove[], userColor: Color): BestMove[] {
    const copyBestMoves = bestMoves.map(bestMove => ({
        ...bestMove,
        move: bestMove.move.map(m => [...m])
    }));
    // userMoves are from 0 to 23, while bestMoves notation from 1 to 24
    // so we need to convert bestMoves notation to userMoves notation if user is white
    if (userColor === 'White') {
        copyBestMoves.forEach(bestMove => {
            bestMove.move.forEach(singleMove => {
                if (singleMove[0] >= 0) {
                    singleMove[0] = singleMove[0] - 1;
                }
                if (singleMove[1] >= 0) {
                    singleMove[1] = singleMove[1] - 1;
                }
            })
        })
    }
    //notation for black is the other way arround in copyBestMoves notation
    // so we need to convert copyBestMoves notation to userMoves notation if user is black
    else {
        copyBestMoves.forEach(bestMove => {
            bestMove.move.forEach(singleMove => {
                if (singleMove[0] >= 0) {
                    singleMove[0] = 24 - singleMove[0];
                }
                if (singleMove[1] >= 0) {
                    singleMove[1] = 24 - singleMove[1];
                }
            })
        })
    }
    console.log('copyBestMoves', copyBestMoves);
    return copyBestMoves;
}

function areMovesSame(move1: number[][], move2: number[][]) {
    const move1Copy = move1.map(m => [...m]);
    const move2Copy = move2.map(m => [...m]);
    if (move1Copy.length !== move2Copy.length) return false;
    move1Copy.sort((a: number[], b: number[]) => a[0] - b[0]);
    move2Copy.sort((a: number[], b: number[]) => a[0] - b[0]);
    return move1Copy.every((innerMove, index) =>
        innerMove[0] === move2Copy[index][0] && innerMove[1] === move2Copy[index][1]
    );
}