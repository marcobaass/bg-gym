import { Position } from "@/types/board";

export const BAR_POINT_WHITE = -1;
export const BAR_POINT_BLACK = -2;

export function getBarPointForPlayer(playerColor: "White" | "Black"): number {
  return playerColor === "White" ? BAR_POINT_WHITE : BAR_POINT_BLACK;
}

/**
 * Check if a point is clickable (has valid moves)
 */
export function isValidPoint(
  position: Position | null,
  pointIndex: number,
  remainingDice: number[],
): boolean {
  if (!position) return false;

  const playerColor = position.playerToPlay as "White" | "Black";

  // Handle bar clicks
  if (pointIndex === BAR_POINT_WHITE || pointIndex === BAR_POINT_BLACK) {
    // Check if it's the correct player's turn
    const isCorrectPlayer =
      (pointIndex === BAR_POINT_WHITE && playerColor === "White") ||
      (pointIndex === BAR_POINT_BLACK && playerColor === "Black");

    if (!isCorrectPlayer) return false;

    // Check if this player has checkers on bar
    const hasCheckersOnBar =
      (pointIndex === BAR_POINT_WHITE && position.barWhite > 0) ||
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
  if (point.count === 0) return false;

  // If player has checkers on Bar, can only play from bar
  if (mustPlayFromBar(position, playerColor)) return false;

  // Check if at least one die can make a legal move
  const availableMoves = getAvailableMoves(pointIndex, remainingDice, position);
  return availableMoves.length > 0;
}

/**
 * Get all legal destination points for a given Point
 */
export function getAvailableMoves(
  fromPoint: number, //selected Checker
  diceValues: number[],
  position: Position,
): number[] {
  const playerColor = position.playerToPlay;

  // 1. Handle Bar Entry separately
  if (fromPoint === BAR_POINT_WHITE || fromPoint === BAR_POINT_BLACK) {
    return getBarEntryMoves(diceValues, position, playerColor);
  }

  // 2. Regular movement logic
  const destinations: number[] = [];
  const direction = playerColor === "White" ? -1 : 1;

  for (const die of diceValues) {
    const destination = fromPoint + die * direction;

    // Check bearing off
    if (destination < 0 || destination >= 24) {
      if (isValidBearingMove(fromPoint, die, position, playerColor)) {
        // -1 for White off-board, 24 for Black off-board
        destinations.push(playerColor === "White" ? -1 : 24);
      }
    } else {
      // Check if destination is valid
      if (
        isValidDestination(fromPoint, destination, die, position, playerColor)
      ) {
        destinations.push(destination);
      }
    }
  }

  return [...new Set(destinations)];
}

/**
 * Get valid entry points from the bar
 */
export function getBarEntryMoves(
  diceValues: number[],
  position: Position,
  playerColor: "White" | "Black",
): number[] {
  const entryPoints: number[] = [];

  // Black enters on points 0-5 (bottom right, points 1-6 in display)
  // White enters on points 18-23 (top right, points 19-24 in display)

  for (const die of diceValues) {
    let entryPoint: number;

    if (playerColor === "Black") {
      entryPoint = die - 1;
    } else {
      entryPoint = 24 - die;
    }

    // Check if entry point is valid
    if (entryPoint < 0 || entryPoint >= 24) continue;

    const destPoint = position.points[entryPoint];

    // Can enter on empty, own checkers, or single opponent checker
    if (
      destPoint.count === 0 ||
      destPoint.owner === playerColor ||
      (destPoint.owner !== playerColor && destPoint.count === 1)
    ) {
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
  playerColor: "White" | "Black",
): boolean {
  const destPoint = position.points[to];

  // Bearing off case
  if (to < 0 || to >= 24) {
    return canBearOff(position, playerColor);
  }

  //Empty point always valid
  if (destPoint.count === 0) return true;

  // Own checkers always valid
  if (destPoint.owner === playerColor) return true;

  // Single opponent checker - can hit (valid)
  if (destPoint.count < 2) return true;

  // Multiple opponent checkers - blocked (invalid)
  if (destPoint.count > 1 && destPoint.owner !== playerColor) return false;

  return false;
}

/**
 * Check if player must play from bar first
 */
export function mustPlayFromBar(
  position: Position,
  playerColor: "White" | "Black",
): boolean {
  if (playerColor === "White") {
    return position.barWhite > 0;
  } else {
    return position.barBlack > 0;
  }
}

/**
 * Check if player can bear off (all checkers in home board)
 */
export function canBearOff(
  position: Position,
  playerColor: "White" | "Black",
): boolean {
  const points = position.points;

  // Checks first all points outside Home and than checkers on bar
  if (playerColor === "White") {
    for (let i = 6; i < 24; i++) {
      if (points[i].count > 0 && points[i].owner === "White") return false;
    }
    return position.barWhite === 0;
  } else {
    if (playerColor === "Black") {
      for (let i = 0; i < 18; i++) {
        if (points[i].count > 0 && points[i].owner === "Black") return false;
      }
    }
    return position.barBlack === 0;
  }
}

export function isValidBearingMove(
  fromPoint: number,
  dieValue: number,
  position: Position,
  playerColor: "White" | "Black",
): boolean {
  if (!canBearOff(position, playerColor)) return false;

  // Converting 0-23 index to a 1-6 "distance from home"
  // White: point 0 is 1, point 5 is 6.
  // Black: point 23 is 1, point 18 is 6.
  const distanceFromHome =
    playerColor === "White" ? fromPoint + 1 : 24 - fromPoint;

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

function getFurthestPoint(
  position: Position,
  playerColor: "White" | "Black",
): number {
  if (playerColor === "White") {
    for (let i = 5; i >= 0; i--) {
      if (position.points[i].owner === "White" && position.points[i].count > 0)
        return i + 1;
    }
  } else {
    for (let i = 18; i <= 23; i++) {
      if (position.points[i].owner === "Black" && position.points[i].count > 0)
        return 24 - i;
    }
  }
  return 0;
}

export function getDieUsedForBearOff(
  fromPoint: number,
  remainingDice: number[],
  position: Position,
): number | null {
  const playerColor = position.playerToPlay;
  const distanceFromHome =
    playerColor === "White" ? fromPoint + 1 : 24 - fromPoint;

  const validDies: number[] = [];
  for (const die of remainingDice) {
    if (
      die === distanceFromHome &&
      isValidBearingMove(fromPoint, die, position, playerColor)
    )
      return die;

    if (
      die > distanceFromHome &&
      isValidBearingMove(fromPoint, die, position, playerColor)
    ) {
      validDies.push(die);
    }
  }
  validDies.sort((a, b) => a - b);
  if (validDies.length > 0) return validDies[0];
  return null;
}

/**
 * Check for number of playable dice for a given position
 */
export function getNumberOfPlayableDice(
  position: Position,
  dice: number[],
): number {
  // base case: no dice
  if (dice.length === 0) return 0;
  if (!hasAnyLegalMoves(position, dice)) return 0;

  // recursive case: check if any dice are playable
  let best = 0;

  for (let index = 0; index < dice.length; index++) {
    const die = dice[index];

    const bar = getBarPointForPlayer(position.playerToPlay);
    let barDestinations: number[] = [];
    if (isValidPoint(position, bar, [die])) {
      barDestinations = getAvailableMoves(bar, [die], position);

      for (const to of barDestinations) {
        const nextPosition = applyMove(position, bar, to);
        const nextDice = [...dice.slice(0, index), ...dice.slice(index + 1)];

        const further = getNumberOfPlayableDice(nextPosition, nextDice);
        best = Math.max(best, 1 + further);
      }
    }

    let destinations: number[] = [];
    for (let i = 0; i < 24; i++) {
      if (isValidPoint(position, i, [die])) {
        destinations = getAvailableMoves(i, [die], position);

        for (const to of destinations) {
          const nextPosition = applyMove(position, i, to);
          const nextDice = [...dice.slice(0, index), ...dice.slice(index + 1)];

          const further = getNumberOfPlayableDice(nextPosition, nextDice);
          best = Math.max(best, 1 + further);
        }
      }
    }
  }

  return best;
}

//Helper functions for getNumberOfPlayableDice
function hasAnyLegalMoves(position: Position, dice: number[]): boolean {
  if (dice.length === 0) return false;

  const bar = getBarPointForPlayer(position.playerToPlay);
  if (isValidPoint(position, bar, dice)) return true;

  for (let i = 0; i < 24; i++) {
    if (isValidPoint(position, i, dice)) return true;
  }
  return false;
}

/**
 * Apply a move to a position
 */
export function applyMove(
  position: Position,
  from: number,
  to: number,
): Position {
  if (!position) return position;

  const updatedPosition = { ...position };

  // Get the owner based on whose turn it is
  const checkerOwner = updatedPosition.playerToPlay;

  // Check if bearing off
  if (to >= 24) {
    updatedPosition.blackOff += 1;
  } else if (to < 0) {
    updatedPosition.whiteOff += 1;
  }

  // Check if moving from bar
  if (from === -1) {
    // Moving white checker from bar
    updatedPosition.barWhite -= 1;
  } else if (from === -2) {
    // Moving black checker from bar
    updatedPosition.barBlack -= 1;
  } else {
    // Moving from regular point - update points array
    updatedPosition.points = updatedPosition.points.map((point, index) => {
      if (index === from) {
        const newCount = point.count - 1;
        return {
          ...point,
          count: newCount,
          owner: newCount === 0 ? undefined : point.owner,
        };
      }
      return point;
    });
  }

  if (to >= 0 && to < 24) {
    updatedPosition.points = updatedPosition.points.map((point, index) => {
      if (index === to) {
        // Check if this is an opponent's blot (single checker)
        const isOpponentBlot =
          point.owner !== null &&
          point.owner !== checkerOwner &&
          point.count === 1;

        // If hitting a blot, send opponent's checker to the bar
        if (isOpponentBlot) {
          if (point.owner === "White") {
            updatedPosition.barWhite += 1;
          } else {
            updatedPosition.barBlack += 1;
          }
        }

        return {
          ...point,
          count: isOpponentBlot ? 1 : point.count + 1,
          owner: checkerOwner,
        };
      }
      return point;
    });
  }

  return updatedPosition;
}
