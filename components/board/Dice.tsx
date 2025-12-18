import React from 'react'
import { Position } from '@/types/board';
import { BOARD_CONFIG, calculateBoardDimensions } from './boardUtils';

type CalculatedDimensions = ReturnType<typeof calculateBoardDimensions>;
type BoardConfig = typeof BOARD_CONFIG;

type Props = {
    boardConfig: BoardConfig;
    positionData: Position | null;
    calculatedDimensions: CalculatedDimensions;
}

const getDotPosition = (value: number): Array<[number, number]> => {
  switch(value) {
    case 1:
      return [[0.5, 0.5]] // Center
    case 2:
      return [[0.25, 0.25], [0.75, 0.75]] // Diagonal
    case 3:
      return [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]] // Diagonal with center
    case 4:
      return [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]] // Corners
    case 5:
      return [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]] // Corners + center
    case 6:
      return [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]] // Two columns
    default:
      return []
  }
}

const renderDice = (value: number, x: number, y: number, size: number, positionData: Position) => {
  const dotPositions = getDotPosition(value)
  const dotRadius = size * 0.08
  const cubeColor = positionData.playerToPlay === 'WhitesTurn' ? 'white' : 'black'
  const circleColor = positionData.playerToPlay === 'WhitesTurn' ? 'black' : 'white'

  return (
    <g key={`dice-${x}-${y}`}>
      <rect
        fill={cubeColor}
        stroke='black'
        strokeWidth='2'
        width={size}
        height={size}
        x={x}
        y={y}
        rx={size * 0.15}
        ry={size * 0.15}
        className='drop-shadow-[2px_2px_1px]'
      />
      {dotPositions.map(([relX, relY], idx) => (
        <circle
          key={`dot-${idx}`}
          fill={circleColor}
          r={dotRadius}
          cx={x + size * relX}
          cy={y + size * relY}
        />
      ))}
    </g>
  )
}

export default function Dice({positionData, calculatedDimensions, boardConfig}: Props) {
  const {
      BOARD_WIDTH,
      BOARD_HEIGHT,
  } = calculatedDimensions;

  const FRAME_WIDTH = boardConfig.FRAME_WIDTH;

  const DICE_SIZE = BOARD_HEIGHT * 0.07
  const DICE_X = BOARD_WIDTH / 4 + BOARD_WIDTH / 2 + DICE_SIZE / 4
  const DICE_Y = BOARD_HEIGHT * 0.5 - FRAME_WIDTH / 4

  if (positionData?.diceRoll) {
    const dice1 = Math.floor(positionData.diceRoll / 10)
    const dice2 = (positionData.diceRoll) % 10

    return (
      <>
        {renderDice(dice1, DICE_X - DICE_SIZE * 0.6, DICE_Y, DICE_SIZE, positionData)}
        {renderDice(dice2, DICE_X + DICE_SIZE * 0.6, DICE_Y, DICE_SIZE, positionData)}
      </>
    )
  }
}
