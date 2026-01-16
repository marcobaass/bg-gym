import { Position } from '@/types/board';
import { BOARD_CONFIG, calculateBoardDimensions } from './boardUtils';
import { BAR_POINT_BLACK, BAR_POINT_WHITE, isValidPoint } from '@/utils/move-utils';
import React, { useState } from 'react'

type CalculatedDimensions = ReturnType<typeof calculateBoardDimensions>;
type BoardConfig = typeof BOARD_CONFIG;

type Props = {
    boardConfig: BoardConfig;
    positionData: Position | null;
    calculatedDimensions: CalculatedDimensions;
    selectedPoint: number | null;  // Add this
    remainingDice: number[];  // Add this
    onCheckerClick: (pointIndex: number) => void;
}

export default function BoardCheckers({
  positionData,
  calculatedDimensions,
  boardConfig,
  selectedPoint,
  remainingDice,
  onCheckerClick
}: Props) {


  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  if(!positionData) return

  const {
      BOARD_WIDTH,
      POINT_WIDTH,
      BOARD_HEIGHT,
      BAR_X_START_RELATIVE,
      BAR_WIDTH,
  } = calculatedDimensions;

  const FRAME_WIDTH = boardConfig.FRAME_WIDTH;
  const FRAME_WIDTH_X = boardConfig.FRAME_WIDTH_X;

  const CHECKER_RADIUS = POINT_WIDTH * 0.8 / 2
  const pointsData = positionData?.points
  const barWhite = positionData?.barWhite
  const barBlack = positionData?.barBlack

  const checkers = []
  const VERTICAL_SPACING = CHECKER_RADIUS * 2
  const STACK_OFFSET = CHECKER_RADIUS * 0.5
  const MAX_STACK = 5
  // Gap between checkers
  const CY_PADDING = 4

  // const clearAllHighlights = () => {
  //   document.querySelectorAll('[data-point]').forEach(el => {
  //     (el as SVGCircleElement).style.stroke = '#000';
  //     (el as SVGCircleElement).style.strokeWidth = '1';
  //   })
  // }

  for(let i = 0; i < pointsData.length; i++) {
    const point = pointsData[i]

    if (point.count > 0) {
      let cx, cyBase;
      const isTopHalf = i >= 12; // Points 1-12 are in top half

      // Calculate X position based on quadrant
      if (i <= 5) {
        // Bottom right quadrant (points 18-23)
        cx = FRAME_WIDTH_X + BOARD_WIDTH - POINT_WIDTH * (i - 0.5) - POINT_WIDTH
      } else if (i <= 11) {
        // Bottom left quadrant (points 12-17), skip the bar
        cx = FRAME_WIDTH_X + BOARD_WIDTH - BAR_WIDTH - POINT_WIDTH * (i + 0.5)
      } else if (i <= 17) {
        // Top left quadrant (points 6-11)
        const offset = i - 12
        cx = FRAME_WIDTH_X + POINT_WIDTH * (offset + 0.5)
      } else {
        // Top right quadrant (points 0-5), skip the bar
        const offset = i - 18
        cx = FRAME_WIDTH_X + BAR_X_START_RELATIVE + BAR_WIDTH + POINT_WIDTH * (offset + 0.5)
      }

      if (isTopHalf) {
        // Top half: start from top, stack downward
        cyBase = FRAME_WIDTH + CHECKER_RADIUS + CY_PADDING
      } else {
        // Bottom half: start from bottom, stack upward
        cyBase = BOARD_HEIGHT - CHECKER_RADIUS + FRAME_WIDTH  - CY_PADDING
      }

      const isClickable = isValidPoint(positionData, i, remainingDice)
      const isSelected = selectedPoint === i
      const isHovered = hoveredPoint === i
      const needsHighlight = isSelected || (isClickable && isHovered)

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
              data-point={i}
              cx={cx}
              cy={cy}
              r={CHECKER_RADIUS}
              fill={point.owner === 'White' ? '#FEEAA0' : '#444444'}
              stroke={needsHighlight ? '#facc15' : '#000'}
              strokeWidth={needsHighlight ? '3' : '1'}
              onMouseEnter={isClickable ? () => setHoveredPoint(i): undefined}
              onMouseLeave={isClickable ? () => setHoveredPoint(null) : undefined}
              onClick={isClickable ? () => onCheckerClick(i) : undefined}

              style={{
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'stroke 0.15s ease, stroke-width 0.15s ease'
              }}
            />
          );
      }
    }
  }

    const drawBarCheckers = (count: number, color: 'White' | 'Black') => {
      const isWhite = color === 'White'
      const barPointIndex = isWhite ? BAR_POINT_WHITE : BAR_POINT_BLACK;
      const isClickable = isValidPoint(positionData, barPointIndex, remainingDice);
      const isSelected = selectedPoint === barPointIndex;
      const isHovered = hoveredPoint === barPointIndex;
      const needsHighlight = isSelected || (isClickable && isHovered);

      const cyBase = isWhite
        ? FRAME_WIDTH + CHECKER_RADIUS + CY_PADDING
        : BOARD_HEIGHT - CHECKER_RADIUS + FRAME_WIDTH - CY_PADDING

      for(let i = 0; i < count; i++) {
        const cx = FRAME_WIDTH_X + BAR_X_START_RELATIVE + BAR_WIDTH / 2
        const stackNumber = Math.floor(i / MAX_STACK)
        const positionInStack = i % MAX_STACK

        const cyStackOffset = isWhite
          ? stackNumber * STACK_OFFSET
          : -stackNumber * STACK_OFFSET

        const cy = isWhite
          ? cyBase + VERTICAL_SPACING * positionInStack + cyStackOffset + CY_PADDING * i
          : cyBase - VERTICAL_SPACING * positionInStack + cyStackOffset - CY_PADDING * i

        checkers.push(
          <circle
            key={`checker-bar${color}-${i}`}
            // data-point = {i}
            cx={cx}
            cy={cy}
            r={CHECKER_RADIUS}
            fill={isWhite ? '#FEEAA0' : '#444444'}
            stroke={needsHighlight ? '#facc15' : '#000'}
            strokeWidth={needsHighlight ? '3' : '1'}
            onMouseEnter={isClickable ? () => setHoveredPoint(barPointIndex) : undefined}
            onMouseLeave={isClickable ? () => setHoveredPoint(null) : undefined}
            onClick={isClickable ? () => onCheckerClick(barPointIndex) : undefined}
            style={{
              cursor: isClickable ? 'pointer' : 'default',
              transition: 'stroke 0.15s ease, stroke-width 0.15s ease'
            }}
          />
        )
      }
    }

    if (barWhite) drawBarCheckers(barWhite, 'White')
    if (barBlack) drawBarCheckers(barBlack, 'Black')

    return <>{checkers}</>
}
