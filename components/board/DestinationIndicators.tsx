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
    POINT_HEIGHT,
    BOARD_HEIGHT,
    BAR_X_START_RELATIVE,
    BAR_WIDTH,
  } = calculatedDimensions

  const FRAME_WIDTH = boardConfig.FRAME_WIDTH
  const FRAME_WIDTH_X = boardConfig.FRAME_WIDTH_X

  const indicators = []
  const INDICATOR_RADIUS = POINT_WIDTH * 0.15

  // Dimensions for the bear-off rectangle indicator
  const RECT_WIDTH = FRAME_WIDTH_X * 0.8
  const RECT_HEIGHT = POINT_HEIGHT

  for (const destination of availableMoves) {
    let cx, cy
    const isBearingOff = destination === -1 || destination === 24

    if (isBearingOff) {
      // Center the rect in the right-side frame tray
      cx = FRAME_WIDTH_X + BOARD_WIDTH + (FRAME_WIDTH_X / 2)

      if (destination === -1) {
        // White bears off (bottom right)
        cy = BOARD_HEIGHT - (RECT_HEIGHT / 2) + FRAME_WIDTH
      } else {
        // Black bears off (top right)
        cy = FRAME_WIDTH + (RECT_HEIGHT / 2)
      }
    } else {
      const isTopHalf = destination >= 12

      // Calculate X position
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
    }

    indicators.push(
      <g key={`destination-${destination}`}>
        {isBearingOff ? (
          /* RECTANGLE INDICATOR FOR BEARING OFF */
          <rect
            x={cx - RECT_WIDTH / 2}
            y={cy - RECT_HEIGHT / 2}
            width={RECT_WIDTH}
            height={RECT_HEIGHT}
            rx={4}
            fill="#22c55e"
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer animate-pulse opacity-80 hover:opacity-100 transition-opacity"
            onClick={() => onDestinationClick(destination)}
          />
        ) : (
          /* CIRCLE INDICATOR FOR NORMAL MOVES */
          <g>
            <circle
              cx={cx}
              cy={cy}
              r={INDICATOR_RADIUS * 2}
              fill="rgba(34, 197, 94, 0.2)"
              className="cursor-pointer"
              onClick={() => onDestinationClick(destination)}
            />
            <circle
              cx={cx}
              cy={cy}
              r={INDICATOR_RADIUS}
              fill="#22c55e"
              stroke="#fff"
              strokeWidth="2"
              className="cursor-pointer animate-pulse pointer-events-none"
            />
          </g>
        )}
      </g>
    )
  }

  return <>{indicators}</>
}
