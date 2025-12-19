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

export default function BornOffCheckers({ positionData, calculatedDimensions, boardConfig }: Props) {

  if (!positionData) {
    return null;
  }

  const {
    BOARD_WIDTH,
    POINT_WIDTH,
    BOARD_HEIGHT,
  } = calculatedDimensions;

  const CHECKER_RADIUS = POINT_WIDTH * 0.8 / 2

  const FRAME_WIDTH = boardConfig.FRAME_WIDTH;
  const FRAME_WIDTH_X = boardConfig.FRAME_WIDTH_X;

  const CY_PADDING = 4

  const whiteOff = positionData.whiteOff
  const blackOff = positionData.blackOff

  const bornOffCheckers = []

  for(let i = 0; i < blackOff; i++) {

    const width = CHECKER_RADIUS * 2
    const height = CHECKER_RADIUS * 0.75
    const y = FRAME_WIDTH + CY_PADDING * i + i * height
    const x = BOARD_WIDTH + FRAME_WIDTH_X + CHECKER_RADIUS / 2


    bornOffCheckers.push (
        <rect
          x = {x}
          y = {y}
          rx = {CHECKER_RADIUS * 0.15}
          fill = '#444444'
          width={width}
          height={height}
          stroke="#000"
          strokeWidth="1"
          className='drop-shadow-[2px_2px_1px]'
        />
    )
  }

  for(let i = 0; i < whiteOff; i++) {

    const width = CHECKER_RADIUS * 2
    const height = CHECKER_RADIUS * 0.75
    const y = BOARD_HEIGHT - CY_PADDING * i - i * height
    const x = BOARD_WIDTH + FRAME_WIDTH_X + CHECKER_RADIUS / 2


    bornOffCheckers.push (
        <rect
          x = {x}
          y = {y}
          rx = {CHECKER_RADIUS * 0.15}
          fill = '#FEEAA0'
          width={width}
          height={height}
          stroke="#000"
          strokeWidth="1"
          className='drop-shadow-[2px_2px_1px]'
        />
    )
  }


  return <>{bornOffCheckers}</>
}
