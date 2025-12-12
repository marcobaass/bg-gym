"use client"
import { Position } from '@/types/board';
import { checkPrimeSync } from 'crypto';
import React from 'react'

type Props = {
  positionData: Position | null;
}

export default function BoardRenderer({positionData}: Props) {

  /**
   * SVG Board as base
   */

  // Total SVG dimensions defined by the viewBox
  const VIEW_WIDTH = 1000
  const VIEW_HEIGHT = 600

  // Frame width in SVG units. This determines the wood frame thickness.
  const FRAME_WIDTH = 20

  // Base dimensions for the *visual* backgammon playing field (excluding frame)
  const BOARD_WIDTH = VIEW_WIDTH - (2 * FRAME_WIDTH) // 1000 - 40 = 960
  const BOARD_HEIGHT = VIEW_HEIGHT - (2 * FRAME_WIDTH) // 600 - 40 = 560

  // Standard Backgammon Geometry: 12 points + 1 bar.
  const POINT_WIDTH = BOARD_WIDTH / 13; // 960 / 13 = ~73.846
  const BAR_WIDTH = POINT_WIDTH; // Bar width is now equal to point width

  // Checker colors
  const PLAYER_1_COLOR = '#FEEAA0'
  const PLAYER_2_COLOR = '#444444'
  const PLAYER_COLORS = { 1: PLAYER_1_COLOR, 2: PLAYER_2_COLOR }

  // Ratio for point height
  const POINT_HEIGHT_RATIO = 2 / 5;
  const POINT_HEIGHT = BOARD_HEIGHT * POINT_HEIGHT_RATIO; // 560 * 2/5 = 224

  // Calculate the starting position of the bar relative to the 960-unit board area (0 to 960)
  const BAR_X_START_RELATIVE = BOARD_WIDTH / 2 - BAR_WIDTH / 2;

  return (
    <div className="w-4/5 aspect-5/3 mx-auto relative">
        <>
          {(() => {
            const svgWidth = VIEW_WIDTH;
            const svgHeight = VIEW_HEIGHT;

            // Width of the playing area on one side of the bar (e.g., left half)
            const HALF_BOARD_WIDTH = BOARD_WIDTH / 2 - BAR_WIDTH / 2;

            const pointsToDraw = [];

            // Loop for drawing the 24 points (triangles)
            for (let i = 1; i <=24; i++) {
              const isTop = i >= 13;
              let X_start_relative = 0; // X position relative to the BOARD_WIDTH area (0 to 960)

              // Determine the relative X starting position based on the quadrant
              if (i >= 1 && i <= 6) {
                // Quadrant 1 (Bottom Right): Points 1-6
                X_start_relative = BOARD_WIDTH - (i * POINT_WIDTH);
              } else if (i >= 7 && i <= 12) {
                // Quadrant 2 (Bottom Left): Points 7-12 (before the bar)
                const pointIndex = i - 7; // 0 to 5
                X_start_relative = pointIndex * POINT_WIDTH;
              } else if (i >= 13 && i <= 18) {
                // Quadrant 3 (Top Left): Points 13-18
                const pointIndex = i - 13; // 0 to 5
                X_start_relative = pointIndex * POINT_WIDTH;
              } else if (i >= 19 && i <= 24) {
                // Quadrant 4 (Top Right): Points 19-24 (after the bar)
                const quadrantStart = BAR_X_START_RELATIVE + BAR_WIDTH;
                const pointIndex = i - 19; // 0 to 5
                X_start_relative = quadrantStart + (pointIndex * POINT_WIDTH);
              }

              // 1. Y coordinates are offset by FRAME_WIDTH
              const Y1 = isTop ? FRAME_WIDTH : svgHeight - FRAME_WIDTH;
              const Y2 = isTop ? POINT_HEIGHT + FRAME_WIDTH : svgHeight - POINT_HEIGHT - FRAME_WIDTH;

              // 2. X coordinates are offset by FRAME_WIDTH
              const X1 = X_start_relative + FRAME_WIDTH;
              const X2 = X1 + (POINT_WIDTH / 2); // Center of the point's base
              const X3 = X1 + POINT_WIDTH; // Right edge of the point's base

              const vertices = `${X1},${Y1} ${X2},${Y2} ${X3},${Y1}`;

              const color = (i % 2 === 0) ? '#D9534F' : '#337AB7';

              pointsToDraw.push(
                <polygon
                  key= {`P${i}`}
                  points={vertices}
                  fill={color}
                  stroke="black"
                  strokeWidth="1"
                />
              );
            }

            return (
              <svg
                  width="100%"
                  height="100%"
                  className='absolute inset-0 w-full h-full font-sans'
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              >
                  {/* Draw the outer frame background (Dark Wood) */}
                  <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="#4E3524" />

                  {/* UPDATED: Draw the Main playing surface (Light Wood) in two halves,
                    leaving a gap for the Bar to sit directly on the dark frame background.
                  */}
                  {/* Left Half */}
                  <rect
                      x={FRAME_WIDTH}
                      y={FRAME_WIDTH}
                      width={HALF_BOARD_WIDTH}
                      height={BOARD_HEIGHT}
                      fill="#E0C4A4"
                  />
                  {/* Right Half */}
                  <rect
                      x={FRAME_WIDTH + BAR_X_START_RELATIVE + BAR_WIDTH}
                      y={FRAME_WIDTH}
                      width={HALF_BOARD_WIDTH}
                      height={BOARD_HEIGHT}
                      fill="#E0C4A4"
                  />

                  {/* The Bar (Dark Wood) - positioned correctly in the center */}
                  <rect
                      x={FRAME_WIDTH + BAR_X_START_RELATIVE}
                      y={FRAME_WIDTH}
                      width={BAR_WIDTH}
                      height={BOARD_HEIGHT}
                      fill="#4E3524"
                  />

                  {pointsToDraw}
                  {drawCheckers(positionData, POINT_WIDTH, BOARD_WIDTH, BOARD_HEIGHT, BAR_X_START_RELATIVE, BAR_WIDTH, FRAME_WIDTH)}

                  {/* Text position, offset by FRAME_WIDTH */}
                  <text x={FRAME_WIDTH + 10} y={FRAME_WIDTH + 20} fill="black" fontSize="16">
                      Board Loaded. Size: {Math.round(BOARD_WIDTH)}x{Math.round(BOARD_HEIGHT)}
                  </text>
              </svg>
            )
          })()}
        </>
    </div>
  )
}





function drawCheckers(positionData, POINT_WIDTH, BOARD_WIDTH, BOARD_HEIGHT, BAR_X_START_RELATIVE, BAR_WIDTH, FRAME_WIDTH) {

  const CHECKER_RADIUS = POINT_WIDTH * 0.8 / 2
  const pointsData = positionData.points

  const checkers = []
  const VERTICAL_SPACING = CHECKER_RADIUS * 2
  const BASE_GAP = POINT_WIDTH * 0.1

  for(let i = 0; i < pointsData.length; i++) {
    const point = pointsData[i]

    if (point.count > 0) {
      let cx, cyBase;
      const isTopHalf = i >= 12; // Points 12-23 are in top half

      // Calculate X position based on quadrant
      if (i <= 5) {
        // Bottom right quadrant (points 0-5)
        cx = BOARD_WIDTH - FRAME_WIDTH + POINT_WIDTH * 0.05 - POINT_WIDTH * i
      } else if (i <= 11) {
        // Bottom left quadrant (points 6-11), skip the bar
        cx = BOARD_WIDTH - FRAME_WIDTH + POINT_WIDTH * 0.05 - POINT_WIDTH * (i + 1)
      } else if (i <= 17) {
        // Top left quadrant (points 12-17)
        const offset = i - 12
        cx = FRAME_WIDTH + POINT_WIDTH * offset + POINT_WIDTH * 0.5
      } else {
        // Top right quadrant (points 18-23), skip the bar
        const offset = i - 18
        cx = FRAME_WIDTH + BAR_X_START_RELATIVE + BAR_WIDTH + POINT_WIDTH * offset + POINT_WIDTH * 0.5
      }

      // Calculate Y base position
      if (isTopHalf) {
        // Top half: start from top, stack downward
        cyBase = FRAME_WIDTH + BASE_GAP
      } else {
        // Bottom half: start from bottom, stack upward
        cyBase = BOARD_HEIGHT - BASE_GAP
      }

      // Draw each checker on this point
      for(let j = 0; j < point.count; j++) {
        const cy = isTopHalf
          ? cyBase + VERTICAL_SPACING * j  // Stack downward for top
          : cyBase - VERTICAL_SPACING * j  // Stack upward for bottom

        checkers.push(
          <circle
            key={`checker-${i}-${j}`}
            cx={cx}
            cy={cy}
            r={CHECKER_RADIUS}
            fill={point.owner === 'White' ? '#FEEAA0' : '#444444'}
          />
        )
      }
    }
  }

  return <>{checkers}</>
}
