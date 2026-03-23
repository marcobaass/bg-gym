import { Position } from "@/types/board";

export default function PositionHeader({ currentPositionIndex, positionData }: { currentPositionIndex: number, positionData: Position[] }) {
  return (
    <div className="text-lg font-semibold mb-2">
        Position {currentPositionIndex + 1} of {positionData.length}
    </div>
  )
}