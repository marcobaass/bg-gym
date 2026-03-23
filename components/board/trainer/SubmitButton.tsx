import { Position } from "@/types/board";

export default function SubmitButton({ current, handleSubmitMove, handleSubmitCubeDecision, disabled }: { current: Position | null, handleSubmitMove: () => void, handleSubmitCubeDecision: () => void, disabled: boolean }) {
  return (
    <div>
        <button
            onClick={current?.analysisType === 'Move' ? handleSubmitMove : handleSubmitCubeDecision}
            disabled={disabled}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
            >
            Submit Move
        </button>
    </div>
  )
}