export const POINTS_PER_SIDE = 12
export const UNIT_WIDTH_RATIO = 1 / (POINTS_PER_SIDE + 1)
export const POINT_HEIGHT_RATIO = 0.45
export const CHECKER_RADIUS_RATIO = POINT_HEIGHT_RATIO / 5

export function getPointCoordinates(pointIndex: number, containerWidth: number): number {
  const POINT_WIDTH = containerWidth * UNIT_WIDTH_RATIO
  const BAR_WIDTH = containerWidth * UNIT_WIDTH_RATIO

  const COLUMN_INDEX = Math.max(pointIndex - 12, 13 - pointIndex)

  let xCoordinate = POINT_WIDTH * (COLUMN_INDEX - 1)
  if (COLUMN_INDEX > 6) {
    xCoordinate += BAR_WIDTH
  }

  return xCoordinate
}

export function getCheckerYPosition() {

}

export function getCheckerXOffset() {

}
