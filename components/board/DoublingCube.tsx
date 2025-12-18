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

export default function DoublingCube({ positionData, calculatedDimensions, boardConfig }: Props) {

  if (!positionData) {
    return null;
  }

  const {
    POINT_WIDTH,
    BOARD_HEIGHT,
  } = calculatedDimensions;

  const CHECKER_RADIUS = POINT_WIDTH * 0.8 / 2

  const FRAME_WIDTH = boardConfig.FRAME_WIDTH;
  const FRAME_WIDTH_X = boardConfig.FRAME_WIDTH_X;

  const cubeValue = positionData.cubeValue
  const cubeOwner = positionData.cubeOwner

  const x = FRAME_WIDTH_X / 2 - POINT_WIDTH / 2

  let y = null

  if (cubeOwner==='White') {
    y = BOARD_HEIGHT - POINT_WIDTH / 2 - FRAME_WIDTH / 2
  } else if (cubeOwner==='Black') {
    y = FRAME_WIDTH
  } else {
    y = BOARD_HEIGHT / 2 - FRAME_WIDTH / 2
  }


  return (
    <>
      <rect
        fill='white'
        stroke='black'
        strokeWidth='2'
        width={POINT_WIDTH}
        height={POINT_WIDTH}
        x={x}
        y={y}
        rx={CHECKER_RADIUS * 0.15}
        ry={CHECKER_RADIUS * 0.15}
        className='drop-shadow-[2px_2px_1px]'
      />
      <text
    x={x + POINT_WIDTH / 2}
    y={y + POINT_WIDTH / 2}
    textAnchor="middle"
    dominantBaseline="middle"
    fill="black"
    fontSize={POINT_WIDTH * 0.6}
    fontWeight="bold"
    fontFamily='arial'
  >
    {cubeValue}
  </text>
    </>
  )
}
