import { Position } from '@/types/board';
import { BOARD_CONFIG, calculateBoardDimensions } from './boardUtils';

type CalculatedDimensions = ReturnType<typeof calculateBoardDimensions>;
type BoardConfig = typeof BOARD_CONFIG;

type Props = {
    boardConfig: BoardConfig;
    positionData: Position | null;
    calculatedDimensions: CalculatedDimensions;
    remainingDice: number[];
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

const renderDice = (value: number, x: number, y: number, size: number, positionData: Position, isUsed: boolean) => {
  const dotPositions = getDotPosition(value)
  const dotRadius = size * 0.08
  const cubeColor = isUsed ? '#94a3b8' : positionData.playerToPlay
  const circleColor = isUsed
    ? '#cbd5e1'
    : (positionData.playerToPlay === "White" ? 'Black' : 'White')

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

export default function Dice({positionData, calculatedDimensions, boardConfig, remainingDice}: Props) {

  if (!positionData) return null;

  const {
      BOARD_WIDTH,
      BOARD_HEIGHT,
  } = calculatedDimensions;

  const FRAME_WIDTH = boardConfig.FRAME_WIDTH;

  const DICE_SIZE = BOARD_HEIGHT * 0.07
  const CENTER_X = BOARD_WIDTH - BOARD_WIDTH / 8 - FRAME_WIDTH / 2
  const DICE_Y = BOARD_HEIGHT * 0.5 - FRAME_WIDTH / 4

  // Berechne den ursprünglichen Wurf (Full Set)
  const d1 = Math.floor(positionData.diceRoll / 10);
  const d2 = positionData.diceRoll % 10;
  const originalDice = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];

  // Kopie der verbleibenden Würfel, um "verbraucht" zu tracken
  const tempRemaining = [...remainingDice];

  return (
    <g id="dice-layer">
      {originalDice.map((value, index) => {
        // Prüfen, ob dieser spezifische Würfelwert noch im verbleibenden Set ist
        const remainingIndex = tempRemaining.indexOf(value);
        let isUsed = true;

        if (remainingIndex !== -1) {
          // Würfel ist noch da -> als aktiv markieren und aus temp-Liste entfernen
          isUsed = false;
          tempRemaining.splice(remainingIndex, 1);
        }

        // Layout: Würfel nebeneinander platzieren
        const offsetMultiplier = index - (originalDice.length - 1) / 2;
        const xPos = CENTER_X + offsetMultiplier * (DICE_SIZE * 1.2) - DICE_SIZE / 2;

        return renderDice(value, xPos, DICE_Y, DICE_SIZE, positionData, isUsed);
      })}
    </g>
  );
}
