import { Position } from "@/types/board";
import { BOARD_CONFIG, calculateBoardDimensions } from "./boardUtils";

type CalculatedDimensions = ReturnType<typeof calculateBoardDimensions>;
type BoardConfig = typeof BOARD_CONFIG;

type Props = {
  boardConfig: BoardConfig;
  positionData: Position | null;
  calculatedDimensions: CalculatedDimensions;
};

export default function DoublingCube({
  positionData,
  calculatedDimensions,
  boardConfig,
}: Props) {
  if (!positionData) {
    return null;
  }

  const { POINT_WIDTH, BOARD_HEIGHT } = calculatedDimensions;

  const CHECKER_RADIUS = (POINT_WIDTH * 0.8) / 2;

  const FRAME_WIDTH = boardConfig.FRAME_WIDTH;
  const FRAME_WIDTH_X = boardConfig.FRAME_WIDTH_X;

  const x = FRAME_WIDTH_X / 2 - POINT_WIDTH / 2;

  const yBlack = FRAME_WIDTH / 2;

  const yWhite = BOARD_HEIGHT + FRAME_WIDTH;

  return (
    <>
      {/* White box */}
      <svg>
        <text
          x={x + POINT_WIDTH / 2}
          y={yWhite - POINT_WIDTH}
          textAnchor="middle"
          fill="white"
          fontWeight="bold"
          fontFamily="arial"
        >
          <tspan
            x={x + POINT_WIDTH / 2}
            dy={-POINT_WIDTH * 0.18}
            fontSize={POINT_WIDTH * 0.2}
          >
            {positionData.pipCountWhite} (
            {positionData.pipCountWhite - positionData.pipCountBlack})
          </tspan>
          <tspan
            x={x + POINT_WIDTH / 2}
            dy={POINT_WIDTH * 0.75}
            fontSize={POINT_WIDTH * 0.6}
          >
            {positionData.scoreWhite}
          </tspan>
        </text>
      </svg>

      {/* Black box */}
      <svg>
        <text
          x={x + POINT_WIDTH / 2}
          y={yBlack + POINT_WIDTH}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontWeight="bold"
          fontFamily="arial"
        >
          <tspan
            x={x + POINT_WIDTH / 2}
            dy={-POINT_WIDTH * 0.18}
            fontSize={POINT_WIDTH * 0.6}
          >
            {positionData.scoreBlack}
            <tspan
              x={x + POINT_WIDTH / 2}
              dy={POINT_WIDTH * 0.5}
              fontSize={POINT_WIDTH * 0.2}
            >
              {positionData.pipCountBlack} (
              {positionData.pipCountBlack - positionData.pipCountWhite})
            </tspan>
          </tspan>
        </text>
      </svg>
    </>
  );
}
