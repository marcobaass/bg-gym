import { Move, CubeOptionRow, BestCubeAction } from "@/types/board";
import { Position } from "@/types/board";

type Props = {
  result: Move | undefined;
  bestMoves: Move[];
  currentPositionIndex: number;
  positionData: Position[];
  score: number;
  totalScore: number;
  cubeOptions?: CubeOptionRow[];
  cubePoints?: number;
  handleNextPosition: () => void;
  handleSessionDone: () => void;
  isConfirmed: boolean;
};

function getMistakeColor(equityDiff: number): string {
  if (equityDiff <= 0.02) {
    return "green";
  } else if (equityDiff < 0.08) {
    return "yellow";
  } else {
    return "red";
  }
}

export default function ResultsSidePanel({
  result,
  bestMoves,
  currentPositionIndex,
  positionData,
  score,
  totalScore,
  cubeOptions,
  cubePoints,
  handleNextPosition,
  handleSessionDone,
  isConfirmed,
}: Props) {
  const currentPosition = positionData[currentPositionIndex];
  const bestEntry = currentPosition?.cubeActions.find(
    (a): a is BestCubeAction => "bestAction" in a,
  );
  const bestActionText = bestEntry?.bestAction;

  return (
    <div className="w-full">
      <div className="w-full bg-white/25 backdrop-blur-sm p-8">
        <div className="text-lg font-semibold mb-2">
          Position {currentPositionIndex + 1} of {positionData.length}
        </div>

        {isConfirmed && (
          <>
            {cubeOptions &&
              cubeOptions.length > 0 &&
              currentPosition?.analysisEngine && (
                <p className="text-sm mb-2">
                  Analysis: {currentPosition.analysisEngine}
                </p>
              )}
            <ul>
              {cubeOptions && cubeOptions.length > 0
                ? cubeOptions.map((opt) => {
                    return (
                      <li
                        key={crypto.randomUUID()}
                        className="flex gap-3 rounded-md p-0.5"
                        style={{
                          backgroundColor: opt.isUserOption
                            ? getMistakeColor(opt.equityDiff)
                            : undefined,
                        }}
                      >
                        <p>{opt.label}</p>
                        <p>{opt.equityDiff.toFixed(3)}</p>
                      </li>
                    );
                  })
                : bestMoves.map((bestMove) => {
                    const isUserMove = bestMove.rank === result?.rank;
                    const equityDiff = bestMoves[0].equity - bestMove.equity;
                    return (
                      <li
                        key={bestMove.rank}
                        className="flex gap-3 rounded-md p-0.5"
                        style={{
                          backgroundColor: isUserMove
                            ? getMistakeColor(equityDiff)
                            : undefined,
                        }}
                      >
                        <p>{bestMove.rank}.</p>
                        {bestMove.move
                          .map((move) => {
                            const from = move[0] < 0 ? "Bar" : move[0];
                            const to = move[1];
                            return `${from}/${to}`;
                          })
                          .join(", ")}
                        <p>
                          {(bestMove.equity - bestMoves[0].equity).toFixed(3)}
                        </p>
                        <p>{bestMove.engine ?? ""}</p>
                      </li>
                    );
                  })}
            </ul>
          </>
        )}
        {bestActionText && isConfirmed && <p>Best Choice: {bestActionText}</p>}
        {isConfirmed && (
          <div>
            <h3>
              Points:{" "}
              {cubeOptions && cubeOptions.length > 0 ? cubePoints : score}
            </h3>
            <h3>Score: {totalScore}</h3>
            {currentPositionIndex === positionData.length - 1 ? (
              <button
                onClick={() => {
                  handleSessionDone();
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Done
              </button>
            ) : (
              <button
                onClick={() => {
                  handleNextPosition();
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
