import { Position } from "@/types/board";

export const BAR_POINT_WHITE = -1
export const BAR_POINT_BLACK = -2

export function getBarPointForPlayer(playerColor: 'White' | 'Black'): number {
  return playerColor === 'White' ? BAR_POINT_WHITE : BAR_POINT_BLACK
}

/**
 * Check if a point is clickable (has valid moves)
 */
export function isValidPoint(
  position: Position | null,
  pointIndex: number,
  remainingDice: number[]
): boolean {
  if (!position) return false;

  const playerColor = position.playerToPlay as 'White' | 'Black';

  // Handle bar clicks
  if (pointIndex === BAR_POINT_WHITE || pointIndex === BAR_POINT_BLACK) {
    // Check if it's the correct player's turn
    const isCorrectPlayer = (pointIndex === BAR_POINT_WHITE && playerColor === 'White') ||
                            (pointIndex === BAR_POINT_BLACK && playerColor === 'Black');

    if (!isCorrectPlayer) return false;

    // Check if this player has checkers on bar
    const hasCheckersOnBar = (pointIndex === BAR_POINT_WHITE && position.barWhite > 0) ||
                             (pointIndex === BAR_POINT_BLACK && position.barBlack > 0);

    if (!hasCheckersOnBar) return false;

    // Check if player can enter with any dice
    const entryMoves = getBarEntryMoves(remainingDice, position, playerColor);
    return entryMoves.length > 0;
  }

  // Regular point validation
  const point = position.points[pointIndex];

  // Must be owned by current player
  if (point.owner !== playerColor) return false;

  // Must have checkers
  if (point.count === 0) return false

  // If player has checkers on Bar, can only play from bar
  if (mustPlayFromBar(position, playerColor)) return false;

  // Check if at least one die can make a legal move
  const availableMoves = getAvailableMoves(pointIndex, remainingDice, position)
  return availableMoves.length > 0;
}

/**
 * Get all legal destination points for a given Point
 */
export function getAvailableMoves(
  fromPoint: number, //selected Checker
  diceValues: number[],
  position: Position
): number[] {
  const playerColor = position.playerToPlay

  // 1. Handle Bar Entry separately
  if (fromPoint === BAR_POINT_WHITE || fromPoint === BAR_POINT_BLACK) {
    return getBarEntryMoves(diceValues, position, playerColor);
  }

  // 2. Regular movement logic
  const destinations: number[] = []
  const direction = playerColor === "White" ? -1 : 1

  for(const die of diceValues) {
    const destination = fromPoint + (die * direction)

    // Check bearing off
    if (destination < 0 || destination >= 24) {

      if (isValidBearingMove(fromPoint, die, position, playerColor)) {
        // -1 for White off-board, 24 for Black off-board
        destinations.push(playerColor === 'White' ? -1 : 24);
      }
    } else {
      // Check if destination is valid
      if (isValidDestination(fromPoint, destination, die, position, playerColor)) {
        destinations.push(destination)
      }
    }
  }

  return [...new Set(destinations)]
}

/**
 * Get valid entry points from the bar
 */
export function getBarEntryMoves(
  diceValues: number[],
  position: Position,
  playerColor: 'White' | 'Black'
): number[] {
  const entryPoints: number[] = [];

  // Black enters on points 0-5 (bottom right, points 1-6 in display)
  // White enters on points 18-23 (top right, points 19-24 in display)

  for (const die of diceValues) {
    let entryPoint: number;

    if (playerColor === 'Black') {
      entryPoint = die - 1;
    } else {
      entryPoint = 24 - die;
    }

    // Check if entry point is valid
    if (entryPoint < 0 || entryPoint >= 24) continue;

    const destPoint = position.points[entryPoint];

    // Can enter on empty, own checkers, or single opponent checker
    if (destPoint.count === 0 ||
        destPoint.owner === playerColor ||
        (destPoint.owner !== playerColor && destPoint.count === 1)) {
      entryPoints.push(entryPoint);
    }
  }
  return [...new Set(entryPoints)];
}

/**
 * Check if a move to a specific destination is legal
 */
export function isValidDestination(
  fromPoint: number,
  to: number,
  diceValue: number,
  position: Position,
  playerColor: 'White' | 'Black'
): boolean {
  const destPoint = position.points[to]

  // Bearing off case
  if (to < 0 || to >= 24) {
    return canBearOff(position, playerColor)
  }

  //Empty point always valid
  if (destPoint.count === 0) return true

  // Own checkers always valid
  if (destPoint.owner === playerColor) return true

  // Single opponent checker - can hit (valid)
  if (destPoint.count < 2) return true

  // Multiple opponent checkers - blocked (invalid)
  if (destPoint.count > 1 && destPoint.owner !== playerColor) return false

  return false
}

/**
 * Check if player must play from bar first
 */
export function mustPlayFromBar(
  position: Position,
  playerColor: 'White' | 'Black'
): boolean {
  if (playerColor === 'White') {
    return position.barWhite > 0
  } else {
    return position.barBlack > 0
  }
}

/**
 * Check if player can bear off (all checkers in home board)
 */
export function canBearOff(
  position: Position,
  playerColor: 'White' | 'Black'
): boolean {
  const points = position.points

  // Checks first all points outside Home and than checkers on bar
  if (playerColor === 'White') {
    for(let i = 6; i < 24; i++) {
      if (points[i].count > 0 && points[i].owner === 'White') return false
    }
    return position.barWhite === 0
  } else {
    if (playerColor === 'Black') {
      for(let i = 0; i < 18; i++) {
        if (points[i].count > 0 && points[i].owner === 'Black') return false
      }
    }
    return position.barBlack === 0
  }
}

export function isValidBearingMove(
  fromPoint: number,
  dieValue: number,
  position: Position,
  playerColor: 'White' | 'Black'
): boolean {
  if (!canBearOff(position, playerColor)) return false

  // Converting 0-23 index to a 1-6 "distance from home"
  // White: point 0 is 1, point 5 is 6.
  // Black: point 23 is 1, point 18 is 6.
  const distanceFromHome = playerColor === 'White' ? fromPoint +1 : 24 - fromPoint;

  // Check if exact bearing off possible
  if (dieValue === distanceFromHome) return true;

  // Check if with higher die bearing off is possible
  if (dieValue > distanceFromHome) {
    // Check if no checkers further back
    const furthest = getFurthestPoint(position, playerColor);
    return distanceFromHome === furthest;
  }

  return false;
}

function getFurthestPoint(position: Position, playerColor: 'White' | 'Black'): number {
  if (playerColor === 'White') {
    for (let i = 5; i >= 0; i--) {
      if (position.points[i].owner === 'White' && position.points[i].count > 0) return i + 1;
    }
  } else {
    for (let i = 18; i <= 23; i++) {
      if (position.points[i].owner === 'Black' && position.points[i].count > 0) return 24 - i;
    }
  }
  return 0;
}
