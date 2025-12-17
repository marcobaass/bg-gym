"use client"
import { Position } from '@/types/board';
import React from 'react'
import { BOARD_CONFIG, calculateBoardDimensions } from './board/boardUtils';
import BoardPoints from './board/BoardPoints';
import BoardCheckers from './board/BoardCheckers';
import Dice from './board/Dice';

type Props = {
  positionData: Position | null;
}

export default function BoardRenderer({positionData}: Props) {

  const calculatedDimensions = calculateBoardDimensions();

  return (
    <>
      <BoardPoints
        positionData={positionData}
        boardConfig={BOARD_CONFIG}
        calculatedDimensions={calculatedDimensions}
      >
        <BoardCheckers
          positionData={positionData}
          boardConfig={BOARD_CONFIG}
          calculatedDimensions={calculatedDimensions}
        />
        <Dice
          positionData={positionData}
          boardConfig={BOARD_CONFIG}
          calculatedDimensions={calculatedDimensions}/>
      </BoardPoints>
    </>
  )
}
