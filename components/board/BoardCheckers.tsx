import { Position } from '@/types/board';
import { BOARD_CONFIG, calculateBoardDimensions } from './boardUtils';
import React from 'react'

type CalculatedDimensions = ReturnType<typeof calculateBoardDimensions>;
type BoardConfig = typeof BOARD_CONFIG;

type Props = {
    boardConfig: BoardConfig;
    positionData: Position | null;
    calculatedDimensions: CalculatedDimensions;
}

export default function BoardCheckers({ positionData, calculatedDimensions, boardConfig }: Props) {

  if (!positionData) {
      return null;
  }

  const {
      BOARD_WIDTH,
      POINT_WIDTH,
      BOARD_HEIGHT,
      BAR_X_START_RELATIVE,
      BAR_WIDTH,
  } = calculatedDimensions;

  const FRAME_WIDTH = boardConfig.FRAME_WIDTH;

    const CHECKER_RADIUS = POINT_WIDTH * 0.8 / 2
    const pointsData = positionData.points

    const checkers = []
    const VERTICAL_SPACING = CHECKER_RADIUS * 2
    const STACK_OFFSET = CHECKER_RADIUS * 0.5
    const MAX_STACK = 5

    for(let i = 0; i < pointsData.length; i++) {
      const point = pointsData[i]

      if (point.count > 0) {
        let cx, cyBase;
        const isTopHalf = i >= 12; // Points 1-12 are in top half

        // Calculate X position based on quadrant
        if (i <= 5) {
          // Bottom right quadrant (points 18-23)
          cx = BOARD_WIDTH - FRAME_WIDTH + POINT_WIDTH * 0.05 - POINT_WIDTH * i
        } else if (i <= 11) {
          // Bottom left quadrant (points 12-17), skip the bar
          cx = BOARD_WIDTH - FRAME_WIDTH + POINT_WIDTH * 0.05 - POINT_WIDTH * (i + 1)
        } else if (i <= 17) {
          // Top left quadrant (points 6-11)
          const offset = i - 12
          cx = FRAME_WIDTH + POINT_WIDTH * offset + POINT_WIDTH * 0.5
        } else {
          // Top right quadrant (points 0-5), skip the bar
          const offset = i - 18
          cx = FRAME_WIDTH + BAR_X_START_RELATIVE + BAR_WIDTH + POINT_WIDTH * offset + POINT_WIDTH * 0.5
        }

        // Calculate Y base position
        const CY_PADDING = 4

        if (isTopHalf) {
          // Top half: start from top, stack downward
          cyBase = FRAME_WIDTH + CHECKER_RADIUS + CY_PADDING
        } else {
          // Bottom half: start from bottom, stack upward
          cyBase = BOARD_HEIGHT - CHECKER_RADIUS + FRAME_WIDTH  - CY_PADDING
        }

        // Draw each checker on this point
        for(let j = 0; j < point.count; j++) {
          const stackNumber = Math.floor(j / MAX_STACK)
          const positionInStack = j % MAX_STACK

          // Apply vertical offset for additional stacks (overlapping)
          const cyStackOffset = isTopHalf
            ? stackNumber * STACK_OFFSET  // Shift down for top half
            : -stackNumber * STACK_OFFSET // Shift up for bottom half

          // Calculate vertical position within the current stack
          const cy = isTopHalf
            ? cyBase + VERTICAL_SPACING * positionInStack + cyStackOffset + CY_PADDING * j
            : cyBase - VERTICAL_SPACING * positionInStack + cyStackOffset - CY_PADDING * j

            checkers.push(
            <circle
              key={`checker-${i}-${j}`}
              cx={cx}
              cy={cy}
              r={CHECKER_RADIUS}
              fill={point.owner === 'White' ? '#FEEAA0' : '#444444'}
              stroke="#000"
              strokeWidth="1"
              className='drop-shadow-[2px_2px_1px]'
            />
          )
        }
      }
    }

    return <>{checkers}</>
  }
