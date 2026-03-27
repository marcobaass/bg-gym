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

  function getPointStartXRelative(
    i: number,
    boardWidth: number,
    pointWidth: number,
    barXStartRelative: number,
    barWidth: number
  ) {
    if (i >= 1 && i <= 6) {
      return boardWidth - (i * pointWidth); // bottom-right
    }
    if (i >= 7 && i <= 12) {
      const pointIndex = i - 7;
      return (5 - pointIndex) * pointWidth; // bottom-left
    }
    if (i >= 13 && i <= 18) {
      const pointIndex = i -13;
      return pointIndex * pointWidth; // top-left
    }
    if (i >= 19 && i <= 24) {
      const pointIndex = i - 19;
      const quadrantStart = barXStartRelative + barWidth;
      return quadrantStart + (pointIndex * pointWidth); // top-right
    }
    throw new Error(`Invalid point index: ${i}`);
  }

  return (
    <div className="w-4/5 aspect-5/3 mx-auto relative">
        {positionData ? (
        <>
          {(() => {
            const svgWidth = boardConfig.VIEW_WIDTH;
            const svgHeight = boardConfig.VIEW_HEIGHT;

            // Width of the playing area on one side of the bar (e.g., left half)
            const HALF_BOARD_WIDTH = BOARD_WIDTH / 2 - BAR_WIDTH / 2;

            const pointsToDraw: React.ReactNode[] = [];
            const labelsToDraw: React.ReactNode[] = [];            

            // Loop for drawing the 24 points (triangles)
            for (let i = 1; i <=24; i++) {
              const isTop = i >= 13;
              const X_start_relative = getPointStartXRelative(
                i, BOARD_WIDTH, POINT_WIDTH, BAR_X_START_RELATIVE, BAR_WIDTH
              );

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

              const labelY = isTop ? Y1 -4 : Y1 + 12;
              const labelText = positionData.playerToPlay === 'White' ?  i : 25-i;
              labelsToDraw.push(
                <text key={`L${i}`} x={X2} y={labelY} textAnchor="middle" fill="white" fontSize="12">
                  {labelText}
                </text>
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

                  {labelsToDraw}
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
