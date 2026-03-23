import { Position } from "@/types/board";

export default function NavigationControls({ currentPositionIndex, positionData, setCurrentPositionIndex }: { currentPositionIndex: number, positionData: Position[], setCurrentPositionIndex: (index: number) => void }) {
  return (
    <div className="space-x-2 mt-2">
        <button
        onClick={() => setCurrentPositionIndex(Math.max(0, currentPositionIndex - 1))}
        disabled={currentPositionIndex === 0}
        className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400"
        >
        Previous
        </button>
        <button
        onClick={() => setCurrentPositionIndex(Math.min(positionData.length - 1, currentPositionIndex + 1))}
        disabled={currentPositionIndex === positionData.length - 1}
        className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400"
        >
        Next
        </button>
    </div>
  )
}