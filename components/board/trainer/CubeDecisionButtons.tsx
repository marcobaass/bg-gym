import clsx from "clsx";
import { Color } from "@/types/board";
import { CubeDecision } from "@/types/board";


export default function CubeDecisionButtons({ isCubePosition, cubeDecisions, setCubeDecision, cubeDecision, userColor, isRedouble }: { isCubePosition: boolean, cubeDecisions: CubeDecision[], setCubeDecision: (decision: CubeDecision) => void, cubeDecision: CubeDecision | null, userColor: Color, isRedouble: boolean }) {
  
    function getCubeButtonLabel(decision: CubeDecision, isRedouble: boolean):string {
        const prefix = isRedouble ? 'Re' : ''

        switch (decision) {
            case 'No Double':
            return isRedouble ? 'No redouble' : 'No double';
            case 'Double/Take':
            return `${prefix}double/Take`;      // "Double/Take" or "Redouble/Take"
            case 'Double/Pass':
            return `${prefix}double/Pass`;      // "Double/Pass" or "Redouble/Pass"
            case 'Too good to double':
            return isRedouble ? 'Too good to redouble' : 'Too good to double';
        }
    }
  
    return (
    <div className="space-x-2">
      {isCubePosition && (
        <>
            {cubeDecisions.map((decision) => (
            <button
                key={decision}
                type="button"
                onClick={() => setCubeDecision(decision)}
                className={clsx(
                "mt-4 px-6 py-2 rounded disabled:bg-gray-400",
                cubeDecision === decision
                    ? "bg-blue-600 text-white"
                    : userColor === 'White'
                    ? "bg-[#FEEAA0] text-gray-800 hover:bg-gray-300"
                        : "bg-gray-800 text-white hover:bg-gray-500"
                )}
            >
                {getCubeButtonLabel(decision, isRedouble)}
            </button>
            ))}
        </>
        )}
    </div>
  )
}