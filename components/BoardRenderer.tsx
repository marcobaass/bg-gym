"use client"
import { Position } from '@/types/board';
import React from 'react'
import { BOARD_CONFIG, calculateBoardDimensions } from './board/boardUtils';
import BoardPoints from './board/BoardPoints';
import BoardCheckers from './board/BoardCheckers';

type Props = {
  positionData: Position | null;
}

export default function BoardRenderer({positionData}: Props) {

  const calculatedDimensions = calculateBoardDimensions();

  return (
    <>
      <BoardPoints
        boardConfig={BOARD_CONFIG}
        positionData={positionData}
        calculatedDimensions={calculatedDimensions}
      >
        <BoardCheckers
          positionData={positionData}
          boardConfig={BOARD_CONFIG}
          calculatedDimensions={calculatedDimensions}
        />
      </BoardPoints>
    </>
  )
}
