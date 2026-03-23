import { BestCubeAction, CubeActions, CubeDecision, ParsedCubeDecisionOption, ParsedCubeDecisionSummary } from "@/types/board";

function normalizeAction(label: string): CubeDecision | null {
  const lower = label.toLowerCase();

  if (lower === 'no double' || lower === 'no redouble') return 'No Double';
  if (lower === 'double/take' || lower === 'redouble/take') return 'Double/Take';
  if (lower === 'double/pass' || lower === 'redouble/pass') return 'Double/Pass';

  return null;
}

export function buildCubeDecisionsSummary(
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