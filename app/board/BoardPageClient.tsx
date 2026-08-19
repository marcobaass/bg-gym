"use client";

import BoardRenderer from "@/components/BoardRenderer";
import {
  Position,
  Move,
  CubeDecision,
  CubeOptionRow,
  Category,
  CategorySession,
} from "@/types/board";
import { Color } from "@/types/board";
import { getAvailableMoves, isValidPoint } from "@/utils/move-utils";
import { uiReducer, INITIAL_UI_STATE } from "@/utils/uiReducer";
import { useState, useEffect, useReducer } from "react";
import { compareWithBestMoves } from "@/utils/compareBestMoves-utils";
import { pointsFromEquityDiff } from "@/utils/scoring-utils";
import { shufflePositions } from "@/utils/userLibrary";
import { useSearchParams, useRouter } from "next/navigation";

import useBoardDestinationClick from "./_hooks/useBoardDestinationClick";

import CubeDecisionButtons from "@/components/board/trainer/CubeDecisionButtons";
import SubmitButton from "@/components/board/trainer/SubmitButton";
import useBoardSubmitCubeDecision from "./_hooks/useBoardSubmitCubeDecision";
import {
  getUserLibrary,
  saveCategorySession,
  movePosition,
  deletePosition,
  deleteCategory,
  canUserEditCategory,
} from "@/utils/repository";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import ResultsSidePanel from "@/components/ResultsSidePanel";

const supabase = createClient();

const cubeDecisions: CubeDecision[] = [
  "No Double",
  "Double/Take",
  "Double/Pass",
];

export default function BoardPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsCategoryId = searchParams.get("categoryId");

  const [positionData, setPositionData] = useState<Position[]>([]);

  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [ui, dispatch] = useReducer(uiReducer, INITIAL_UI_STATE);
  const [result, setResult] = useState<Move | undefined>(undefined);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const userColor = ui.currentPosition?.playerToPlay ?? "White";
  const [cubeDecision, setCubeDecision] = useState<CubeDecision | null>(null);

  const current = positionData[currentPositionIndex] ?? null;
  const isRedouble = current ? current.cubeOwner !== "none" : false;

  const [cubeOptions, setCubeOptions] = useState<CubeOptionRow[]>([]);
  const [cubePoints, setCubePoints] = useState<number>(0);

  const [user, setUser] = useState<User | null | undefined>(undefined);

  const [categories, setCategories] = useState<Category[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  //User data from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Unsubscribe from auth state changes on unmount
    return () => subscription.unsubscribe();
  }, []);

  //Position data
  useEffect(() => {
    if (user === undefined) return;

    const fetchPositionData = async () => {
      const userLibrary = await getUserLibrary(supabase, user);
      const categoryPositions =
        userLibrary.library.find(
          (category) => category.category.id === searchParamsCategoryId,
        )?.positions ?? [];
      const newCategorys = userLibrary.library.map(
        (category) => category.category,
      );
      setCategories(newCategorys);
      const shuffled = [...categoryPositions];
      const shuffledPositions = shufflePositions(shuffled);
      const positionCount =
        localStorage.getItem("positionsPerSession") ?? "all";

      if (positionCount === "all") {
        setPositionData(shuffledPositions);
      } else {
        const limitedPositions = shuffledPositions.slice(
          0,
          Number(positionCount),
        );
        setPositionData(limitedPositions);
      }
      setIsLoading(false);
    };

    fetchPositionData();
  }, [user, searchParamsCategoryId]);

  // When the Position changes get new "position" from positionData
  useEffect(() => {
    const position = positionData[currentPositionIndex] ?? null;
    dispatch({ type: "POSITION_CHANGED", position });
  }, [currentPositionIndex, positionData]);

  const handleNextPosition = () => {
    setCubeDecision(null);
    setCubeOptions([]);
    setCubePoints(0);
    setCurrentPositionIndex(
      Math.min(positionData.length - 1, currentPositionIndex + 1),
    );
    setIsConfirmed(false);
  };

  const positionsPlayed = positionData.length;

  const handleSessionDone = async () => {
    setCubeDecision(null);
    setCubeOptions([]);
    setCubePoints(0);
    const categorySession: CategorySession = {
      id: crypto.randomUUID(),
      categoryId: searchParamsCategoryId ?? "",
      finishedAt: Date.now(),
      positionsPlayed: positionsPlayed,
      rawTotalScore: ui.totalScore,
      scorePerPosition:
        positionsPlayed > 0 ? ui.totalScore / positionData.length : 0,
    };
    if (searchParamsCategoryId) {
      await saveCategorySession(supabase, user ?? null, categorySession);
    }
    router.push("/");
  };

  const handleCheckerClick = (pointIndex: number) => {
    // Check if point is clickable
    if (!isValidPoint(ui.currentPosition, pointIndex, ui.remainingDice)) {
      return;
    }

    // Set selected point
    dispatch({ type: "SELECT_POINT", point: pointIndex });

    // Calculate and set available moves
    if (ui.currentPosition) {
      const moves = getAvailableMoves(
        pointIndex,
        ui.remainingDice,
        ui.currentPosition,
      );
      dispatch({ type: "SET_MOVES", moves });
    }
  };

  const { handleDestinationClick } = useBoardDestinationClick({ ui, dispatch });

  const handleSubmitMove = () => {
    try {
      const userMoves = ui.moves;

      const bestMoves = positionData[currentPositionIndex].bestMoves;

      const comparisonResult = compareWithBestMoves(
        userMoves,
        bestMoves,
        userColor as Color,
      );

      let pointsForMove: number;
      if (comparisonResult === undefined) {
        // User's move is not in bestMoves at all → 0 points
        pointsForMove = 0;
      } else {
        const bestEquity = bestMoves[0]?.equity ?? 0;
        const userEquity = comparisonResult.equity ?? 0;
        pointsForMove = pointsFromEquityDiff(bestEquity, userEquity);
      }

      dispatch({ type: "ADD_SCORE", score: pointsForMove });
      setResult(comparisonResult as Move);
      setIsConfirmed(true);
    } catch (error) {
      console.error("Error in handleSubmitMove:", error);
    }
  };

  const { handleSubmitCubeDecision } = useBoardSubmitCubeDecision({
    positionData,
    currentPositionIndex,
    cubeDecision,
    setCubePoints,
    setCubeOptions,
    setIsConfirmed,
    dispatch,
  });

  // ------------------------------------ Handler for position actions ------------------------------------

  const getRemainingPositionCount = async (categoryId: string) => {
    const userLibrary = await getUserLibrary(supabase, user ?? null);
    const categoryPositions =
      userLibrary.library.find(
        (category) => category.category.id === categoryId,
      )?.positions.length ?? 0;
    return categoryPositions;
  };

  const handleMovePosition = async (targetCategoryId: string) => {
    if (!targetCategoryId) return;
    const current = positionData[currentPositionIndex] ?? null;
    if (!current) return;
    const currentId = current.id;
    if (
      !currentId ||
      !searchParamsCategoryId ||
      searchParamsCategoryId === targetCategoryId
    )
      return;

    const success = await movePosition(
      supabase,
      user ?? null,
      searchParamsCategoryId,
      targetCategoryId,
      currentId,
    );

    if (!success) {
      alert("Could not move position.");
      return;
    }

    const remainingPositionCount = await getRemainingPositionCount(
      searchParamsCategoryId,
    );
    const newPositionData = positionData.filter(
      (position) => position.id !== currentId,
    );
    if (remainingPositionCount === 0) {
      await deleteCategory(supabase, user ?? null, searchParamsCategoryId);
      router.push("/");
      return;
    } else if (currentPositionIndex >= newPositionData.length) {
      setCurrentPositionIndex(newPositionData.length - 1);
    }

    // Clean up the UI
    setPositionData(newPositionData);
    setCubeDecision(null);
    setCubeOptions([]);
    setCubePoints(0);
    setIsConfirmed(false);
    setResult(undefined);
  };

  const handleDeletePosition = async () => {
    const current = positionData[currentPositionIndex] ?? null;
    if (!current) return;
    const currentId = current.id;
    if (!currentId) return;
    if (!searchParamsCategoryId) return;

    const success = await deletePosition(
      supabase,
      user ?? null,
      searchParamsCategoryId,
      currentId,
    );
    if (!success) {
      alert("Could not delete position.");
      return;
    }

    const remainingPositionCount = await getRemainingPositionCount(
      searchParamsCategoryId,
    );
    const newPositionData = positionData.filter(
      (position) => position.id !== currentId,
    );
    if (remainingPositionCount === 0) {
      await deleteCategory(supabase, user ?? null, searchParamsCategoryId);
      router.push("/");
      return;
    } else if (currentPositionIndex >= newPositionData.length) {
      setCurrentPositionIndex(newPositionData.length - 1);
    }

    // Clean up the UI
    setPositionData(newPositionData);
    setCubeDecision(null);
    setCubeOptions([]);
    setCubePoints(0);
    setIsConfirmed(false);
    setResult(undefined);
  };

  const isCubePosition = current?.analysisType === "Cube";

  return isLoading ? (
    <div>Loading...</div>
  ) : positionData.length > 0 ? (
    <div className="flex h-dvh w-full flex-row">
      {/* Results Side Panel */}
      <aside className="min-w-[280px] flex-1">
        <ResultsSidePanel
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
          isConfirmed={isConfirmed}
          categories={categories}
          currentCategoryId={searchParamsCategoryId}
          onMovePosition={handleMovePosition}
          onDeletePosition={handleDeletePosition}
          canEditPosition={canUserEditCategory(
            user ?? null,
            categories.find(
              (category) => category.id === searchParamsCategoryId,
            )?.visibility,
          )}
        />
      </aside>

      {/* Board */}
      <div
        className="flex h-dvh shrink-0 flex-col"
        style={{
          width: "min(80vw, calc(100svh * 5 / 4), calc(100vw - 380px))",
        }}
      >
        <div className="relative w-full max-h-full aspect-[5/4] @container">
          <BoardRenderer
            positionData={ui.currentPosition}
            selectedPoint={ui.selectedPoint}
            availableMoves={ui.availableMoves}
            remainingDice={ui.remainingDice}
            onCheckerClick={handleCheckerClick}
            onDestinationClick={handleDestinationClick}
          />
          {(current?.analysisType === "Cube" ||
            current?.analysisType === "Move") && (
            <div className="absolute inset-0 flex flex-col gap-[1.5cqw] items-center justify-center pointer-events-none">
              <div className="absolute text-[2cqw] left-[27.4%] top-[50%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-auto">
                <CubeDecisionButtons
                  isCubePosition={isCubePosition}
                  cubeDecisions={cubeDecisions}
                  setCubeDecision={setCubeDecision}
                  cubeDecision={cubeDecision}
                  userColor={userColor}
                  isRedouble={isRedouble}
                />
              </div>
              {current?.analysisType === "Move" && (
                <button
                  className="text-[1.5cqw] px-[1cqw] py-[0.25cqw] rounded-[0.5cqw] border-[0.15cqw] border-black enabled:bg-gray-100 disabled:bg-gray-300 text-black enabled:hover:bg-white pointer-events-auto enabled:cursor-pointer"
                  onClick={() => dispatch({ type: "UNDO_MOVE" })}
                  disabled={ui.moveHistory.length === 0 || isConfirmed}
                >
                  ↩
                </button>
              )}
              <SubmitButton
                current={current}
                handleSubmitMove={handleSubmitMove}
                handleSubmitCubeDecision={handleSubmitCubeDecision}
                disabled={
                  isConfirmed ||
                  (current?.analysisType === "Move"
                    ? ui.remainingDice.length > 0
                    : cubeDecision === null)
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div>No positions available</div>
  );
}
