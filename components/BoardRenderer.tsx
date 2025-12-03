"use client"
import React from 'react'
import { BoardState, PositionAnalysis } from '@/types/board'
import { useState, useEffect } from 'react'

type Props = {
  boardState: BoardState,
  analysis: PositionAnalysis
}

export default function BoardRendere({boardState, analysis}: Props) {

  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)


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
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ border: '2px solid black', maxWidth: '100%', maxHeight: '100%' }}
        >
            <rect x="0" y="0" width={width} height={height} fill="#E0C4A4" />
            <text x={10} y={20} fill="black" fontSize="16">
                Board Loaded. Size: {Math.round(width)}x{Math.round(height)}
            </text>
        </svg>
    </div>
  )
}
