import React from 'react'
import { BOARD_CONFIG, calculateBoardDimensions } from './boardUtils';
import { Position } from '@/types/board';

type CalculatedDimensions = ReturnType<typeof calculateBoardDimensions>;
type BoardConfig = typeof BOARD_CONFIG;

type Props = {
  boardConfig: BoardConfig;
  positionData: Position | null;
  calculatedDimensions: CalculatedDimensions;
  children?: React.ReactNode;
}

export default function BoardPoints({ boardConfig, positionData, calculatedDimensions, children }: Props) {

  const {
    BOARD_WIDTH,
    BOARD_HEIGHT,
    POINT_WIDTH,
    BAR_WIDTH,
    POINT_HEIGHT,
    BAR_X_START_RELATIVE,
  } = calculatedDimensions;

  const FRAME_WIDTH = boardConfig.FRAME_WIDTH;
  const FRAME_WIDTH_X = boardConfig.FRAME_WIDTH_X;

  return (
    <div className="w-4/5 aspect-5/3 mx-auto relative">
        {positionData ? (
        <>
          {(() => {
            const svgWidth = boardConfig.VIEW_WIDTH;
            const svgHeight = boardConfig.VIEW_HEIGHT;

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
              const X1 = X_start_relative + FRAME_WIDTH_X;
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
                      x={FRAME_WIDTH_X}
                      y={FRAME_WIDTH}
                      width={HALF_BOARD_WIDTH}
                      height={BOARD_HEIGHT}
                      fill="#E0C4A4"
                  />
                  {/* Right Half */}
                  <rect
                      x={FRAME_WIDTH_X + BAR_X_START_RELATIVE + BAR_WIDTH}
                      y={FRAME_WIDTH}
                      width={HALF_BOARD_WIDTH}
                      height={BOARD_HEIGHT}
                      fill="#E0C4A4"
                  />

                  {/* The Bar (Dark Wood) - positioned correctly in the center */}
                  <rect
                      x={FRAME_WIDTH_X + BAR_X_START_RELATIVE}
                      y={FRAME_WIDTH}
                      width={BAR_WIDTH}
                      height={BOARD_HEIGHT}
                      fill="#4E3524"
                  />

                  {pointsToDraw}

                  {children}

                  {/* Text position, offset by FRAME_WIDTH */}
                  <text x={FRAME_WIDTH + 10} y={FRAME_WIDTH + 20} fill="black" fontSize="16">
                      Board Loaded. Size: {Math.round(BOARD_WIDTH)}x{Math.round(BOARD_HEIGHT)}
                  </text>
              </svg>
            )
          })()}
        </>

        ) : (
          <div>No position data</div>
        )}
    </div>
  )
}
