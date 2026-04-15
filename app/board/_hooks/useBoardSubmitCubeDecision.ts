import { CubeDecision, CubeOptionRow, Position } from '@/types/board';
import { buildCubeDecisionsSummary } from '@/utils/cubeDecision-utils';
import { pointsFromEquityDiff } from '@/utils/scoring-utils';
import { uiReducer } from '@/utils/uiReducer';
import type { Dispatch } from 'react';

type UiAction = Parameters<typeof uiReducer>[1];

export default function useBoardSubmitCubeDecision({
    positionData,
    currentPositionIndex,
    cubeDecision,
    setCubePoints,
    setCubeOptions,
    setShowResultsModal,
    dispatch,
}: {
    positionData: Position[];
    currentPositionIndex: number;
    cubeDecision: CubeDecision | null;
    setCubePoints: (points: number) => void;
    dispatch: Dispatch<UiAction>;
    setCubeOptions: (options: CubeOptionRow[]) => void;
    setShowResultsModal: (show: boolean) => void;
}) {
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
          .map((opt) => {
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

    return { handleSubmitCubeDecision }
}