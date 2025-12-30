"use client"
import { Position } from '@/types/board';
import React from 'react'
import { BOARD_CONFIG, calculateBoardDimensions } from './board/boardUtils';
import BoardPoints from './board/BoardPoints';
import BoardCheckers from './board/BoardCheckers';
import Dice from './board/Dice';
import BornOffCheckers from './board/BornOffCheckers';
import DoublingCube from './board/DoublingCube';
import DestinationIndicators from './board/DestinationIndicators'

type Props = {
  positionData: Position | null;
  selectedPoint: number | null;
  availableMoves: number[];
  onCheckerClick: (pointIndex: number) => void;
  onDestinationClick: (destinationPoint: number) => void;
  remainingDice: number[];
}

export default function BoardRenderer({
  positionData,
  selectedPoint,
  availableMoves,
  remainingDice,
  onCheckerClick,
  onDestinationClick
}: Props) {

  if (!positionData) {
    return <div>No position data available</div>;
  }

  const calculatedDimensions = calculateBoardDimensions();

  return (
    <>
      <div className='flex justify-center' style={{ gap: `${calculatedDimensions.BAR_WIDTH}px` }}>
        <p>{`Score Black: ${positionData?.scoreBlack} (${positionData?.matchLength})`}</p>
        <p>{`Pip Black: ${positionData?.pipCountBlack} (${positionData?.pipCountBlack - positionData?.pipCountWhite})`}</p>
      </div>
      <BoardPoints
        positionData={positionData}
        boardConfig={BOARD_CONFIG}
        calculatedDimensions={calculatedDimensions}
      >
        <BoardCheckers
          positionData={positionData}
          calculatedDimensions={calculatedDimensions}
          boardConfig={BOARD_CONFIG}
          selectedPoint={selectedPoint}
          remainingDice={remainingDice}
          onCheckerClick={onCheckerClick}
        />
        <DestinationIndicators
          availableMoves={availableMoves}
          calculatedDimensions={calculatedDimensions}
          boardConfig={BOARD_CONFIG}
          onDestinationClick={onDestinationClick}
        />
        <Dice
          positionData={positionData}
          boardConfig={BOARD_CONFIG}
          calculatedDimensions={calculatedDimensions}
        />
        <BornOffCheckers
          positionData={positionData}
          boardConfig={BOARD_CONFIG}
          calculatedDimensions={calculatedDimensions}
        />
        <DoublingCube
          positionData={positionData}
          boardConfig={BOARD_CONFIG}
          calculatedDimensions={calculatedDimensions}
        />
      </BoardPoints>
      <div className='flex justify-center' style={{ gap: `${calculatedDimensions.BAR_WIDTH}px` }}>
        <p>{`Score White: ${positionData?.scoreWhite} (${positionData?.matchLength})`}</p>
        <p>{`Pip White: ${positionData?.pipCountWhite} (${positionData?.pipCountWhite - positionData?.pipCountBlack})`}</p>
      </div>
    </>
  )
}
