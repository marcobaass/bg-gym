import { Position } from "@/types/board";

export default function SubmitButton({ current, handleSubmitMove, handleSubmitCubeDecision, disabled }: { current: Position | null, handleSubmitMove: () => void, handleSubmitCubeDecision: () => void, disabled: boolean }) {
  return (
    
      <button
          onClick={current?.analysisType === 'Move' ? handleSubmitMove : handleSubmitCubeDecision}
          disabled={disabled}
          className="bg-green-600 disabled:bg-gray-300 text-black text-[1.5cqw] px-[1cqw] py-[0.25cqw] rounded-[0.5cqw] border-[0.15cqw] border border-black cursor-pointer enabled:hover:bg-green-500 pointer-events-auto"
        >
          ✔
      </button>
    
  )
}