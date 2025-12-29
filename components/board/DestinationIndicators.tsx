import React from 'react'
import { BOARD_CONFIG, calculateBoardDimensions } from './boardUtils'

type CalculatedDimensions = ReturnType<typeof calculateBoardDimensions>
type BoardConfig = typeof BOARD_CONFIG

type Props = {
  availableMoves: number[]
  calculatedDimensions: CalculatedDimensions
  boardConfig: BoardConfig
  onDestinationClick: (destination: number) => void
}

export default function DestinationIndicators({
  availableMoves,
  calculatedDimensions,
  boardConfig,
  onDestinationClick
}: Props) {

  if (availableMoves.length === 0) return null

  const {
    BOARD_WIDTH,
    POINT_WIDTH,
    BOARD_HEIGHT,
    BAR_X_START_RELATIVE,
    BAR_WIDTH,
  } = calculatedDimensions

  const FRAME_WIDTH = boardConfig.FRAME_WIDTH
  const FRAME_WIDTH_X = boardConfig.FRAME_WIDTH_X

  const indicators = []
  const INDICATOR_RADIUS = POINT_WIDTH * 0.15

  for (const destination of availableMoves) {
    // Handle bearing off (-1)
    if (destination === -1) {
      // Todo
      // Show indicator outside the board for bearing off
      // We'll skip this for now, add later if needed
      continue
    }

    let cx, cy
    const isTopHalf = destination >= 12

    // Calculate X position (same logic as checkers)
    if (destination <= 5) {
      cx = FRAME_WIDTH_X + BOARD_WIDTH - POINT_WIDTH * (destination - 0.5) - POINT_WIDTH
    } else if (destination <= 11) {
      cx = FRAME_WIDTH_X + BOARD_WIDTH - BAR_WIDTH - POINT_WIDTH * (destination + 0.5)
    } else if (destination <= 17) {
      const offset = destination - 12
      cx = FRAME_WIDTH_X + POINT_WIDTH * (offset + 0.5)
    } else {
      const offset = destination - 18
      cx = FRAME_WIDTH_X + BAR_X_START_RELATIVE + BAR_WIDTH + POINT_WIDTH * (offset + 0.5)
    }

    // Calculate Y position - place at the tip of the point
    if (isTopHalf) {
      cy = FRAME_WIDTH + POINT_WIDTH / 2 - INDICATOR_RADIUS / 2 + 2
    } else {
      cy = BOARD_HEIGHT - FRAME_WIDTH + INDICATOR_RADIUS / 2 + 5
    }

    indicators.push(
      <g key={`destination-${destination}`}>
        {/* Semi-transparent background circle */}
        <circle
          cx={cx}
          cy={cy}
          r={INDICATOR_RADIUS * 2}
          fill="rgba(34, 197, 94, 0.2)"
          stroke="none"
          className="cursor-pointer"
          onClick={() => onDestinationClick(destination)}
        />
        {/* Solid indicator dot */}
        <circle
          cx={cx}
          cy={cy}
          r={INDICATOR_RADIUS}
          fill="#22c55e"
          stroke="#fff"
          strokeWidth="2"
          className="cursor-pointer animate-pulse"
          onClick={() => onDestinationClick(destination)}
        />
      </g>
    )
  }

  return <>{indicators}</>
}
