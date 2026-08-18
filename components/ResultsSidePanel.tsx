import { Move, CubeOptionRow, BestCubeAction } from "@/types/board";
import { Position, Category } from "@/types/board";
import { useState } from "react";

type EditAction = "" | "move" | "delete";

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
  categories: Category[];
  currentCategoryId: string | null;
  onMovePosition: (targetCategoryId: string) => void;
  onDeletePosition: () => void;
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
  categories,
  currentCategoryId,
  onMovePosition,
  onDeletePosition,
}: Props) {
  const currentPosition = positionData[currentPositionIndex];
  const bestEntry = currentPosition?.cubeActions.find(
    (a): a is BestCubeAction => "bestAction" in a,
  );
  const bestActionText = bestEntry?.bestAction;
  const [editAction, setEditAction] = useState<EditAction>("");
  const [isEditing, setIsEditing] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<string | null>(null);

  const handleEditAction = (action: EditAction) => {
    if (action === "move") {
      if (targetCategoryId) {
        onMovePosition(targetCategoryId);
      }
    } else if (action === "delete") {
      if (confirm("Are you sure you want to delete this position?")) {
        onDeletePosition();
      } else {
        return;
      }
    }
    setIsEditing(false);
    setEditAction("");
    setTargetCategoryId(null);
  };

  return (
    <div className="w-full">
      <div className="w-full bg-white/25 backdrop-blur-sm p-8">
        <div className="text-lg font-semibold mb-2">
          Position {currentPositionIndex + 1} of {positionData.length}
        </div>

        {/* Edit Position */}
        {!isEditing ? (
          <div className="w-full">
            <button
              className="px-2 py-2 bg-indigo-600 text-white rounded"
              type="button"
              onClick={() => setIsEditing(true)}
            >
              Edit Position
            </button>
          </div>
        ) : (
          <div className="flex gap-2 flex-col items-start">
            <label htmlFor="edit-position">Edit Position</label>

            <select
              name="edit"
              id="edit-position"
              value={editAction}
              onChange={(e) => setEditAction(e.target.value as EditAction)}
            >
              <option value="">Select an action</option>
              <option value="move">move</option>
              <option value="delete">delete</option>
            </select>

            {editAction === "move" && (
              <select
                name="target-category"
                id="target-category"
                value={targetCategoryId ?? ""}
                onChange={(e) => setTargetCategoryId(e.target.value)}
              >
                <option value="">Select a category</option>
                {categories
                  .filter((category) => category.id !== currentCategoryId)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            )}

            <button
              className="px-2 py-2 bg-indigo-600 text-white rounded"
              type="button"
              disabled={
                !editAction || (editAction === "move" && !targetCategoryId)
              }
              onClick={() => handleEditAction(editAction)}
            >
              Apply
            </button>
            <button
              className="px-2 py-2 bg-indigo-600 text-white rounded"
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditAction("");
                setTargetCategoryId(null);
              }}
            >
              Cancel
            </button>
          </div>
        )}

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
                            const to =
                              move[1] === 25 || move[1] === -1
                                ? "Off"
                                : move[1];
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
