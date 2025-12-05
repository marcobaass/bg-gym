"use client"
import React from 'react'
import { BoardState, PositionAnalysis } from '@/types/board'
import { useState, useEffect } from 'react'

import { UNIT_WIDTH_RATIO, POINT_HEIGHT_RATIO, getPointCoordinates } from '@/utils/renderer-utils'

type Props = {
  boardState: BoardState,
  analysis: PositionAnalysis
}

export default function BoardRenderer({boardState, analysis}: Props) {

  const VIEW_WIDTH = 1000
  const VIEW_HEIGHT = 800

  return (
    <div className="w-4/5 aspect-5/4 mx-auto relative">
        <>
          {(() => {
            const containerWidth = VIEW_WIDTH
            const containerHeight = VIEW_HEIGHT

            const POINT_WIDTH = containerWidth * UNIT_WIDTH_RATIO;
            const POINT_HEIGHT = containerHeight * POINT_HEIGHT_RATIO;

            const pointsToDraw = [];

            for (let i = 1; i <=24; i++) {
              const isTop = i >= 13;

              const Y1 = isTop ? 0 : containerHeight;
              const Y2 = isTop ? POINT_HEIGHT : containerHeight - POINT_HEIGHT;

              const X1 = getPointCoordinates(i, containerWidth);
              const X2 = X1 + (POINT_WIDTH / 2);
              const X3 = X1 + POINT_WIDTH;

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
                className='absolute inset-0 border-2 border-black border-solid w-full h-full font-sans'
                viewBox={`0 0 ${containerWidth} ${containerHeight}`}
            >
                <rect x="0" y="0" width={containerWidth} height={containerHeight} fill="#E0C4A4" />
                {pointsToDraw}

                <text x={10} y={20} fill="black" fontSize="16">
                    Board Loaded. Size: {Math.round(containerWidth)}x{Math.round(containerHeight)}
                </text>
            </svg>

          )
          })()}
        </>
    </div>
  )
}
