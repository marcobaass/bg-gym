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

  const [width, setWidth] = useState<number | null>(null)
  const [height, setHeight] = useState<number | null>(null)


  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }

    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])


  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {width && height ? (
        <>
          {(() => {
            const containerWidth = width as number
            const containerHeight = height as number

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
                width={containerWidth}
                height={containerHeight}
                viewBox={`0 0 ${containerWidth} ${containerHeight}`}
                style={{ border: '2px solid black', maxWidth: '100%', maxHeight: '100%', fontFamily: 'Inter' }}
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
      ) : (<><div>Loading Board ...</div></>)}
    </div>
  )
}
