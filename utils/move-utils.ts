import { Position, Color, Point } from "@/types/board";

/**
 * Check if a point is clickable (has valid moves)
 */
export function isValidPoint(
  position: Position | null,
  pointIndex: number,
  remainingDice: number[]
): boolean {
  if (!position) return false;

  const point = position.points[pointIndex];

  // Must be owned by current player
  if (point.owner === 'White') {
    if (position.playerToPlay !== 'White')
    return false
  } else {
    if (position.playerToPlay !== 'Black') return false
  }


  // Must have checkers
  if (point.count === 0) return false

  // If player has checkers on Bar, can only play from bar
  const playerColor = position.playerToPlay
  if (mustPlayFromBar(position, playerColor)) return false;

  // Check if at least one die can make a legal move
  const availableMoves = getAvailableMoves(pointIndex, remainingDice, position)
  return availableMoves.length > 0;
}

/**
 * Get all legal destination points for a given Point
 */
export function getAvailableMoves(
  fromPoint: number,
  diceValues: number[],
  position: Position
): number[] {
  const destinations: number[] = []
  const playerColor = position.playerToPlay
  const direction = playerColor === "White" ? -1 : 1

  for(const die of diceValues) {
    const destination = fromPoint + (die * direction)

    // Check bearing off
    if (destination < 0 || destination >= 24) {
      if (canBearOff(position, playerColor)) {
        // -1 represents bearing off
        destinations.push(-1)
      }
      continue
    }

    // Check if destination is valid
    if (isValidDestination(fromPoint, destination, die, position, playerColor)) {
      destinations.push(destination)
    }
  }
  return [...new Set(destinations)]
}

/**
 * Check if a move to a specific destination is legal
 */
export function isValidDestination(
  fromPoint: number,
  to: number,
  diceValue: number,
  position: Position | null,
  playerColor: string
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
  playerColor: string
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
  playerColor: string
): boolean {
  const points = position.points

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
