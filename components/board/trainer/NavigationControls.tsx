export default function NavigationControls({ onPrevious, onNext, canGoPrevious, canGoNext }: { onPrevious: () => void, onNext: () => void, canGoPrevious: boolean, canGoNext: boolean }) {
  return (
    <div className="space-x-2 mt-2">
        <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400"
        >
        Previous
        </button>
        <button
        onClick={onNext}
        disabled={!canGoNext}
        className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400"
        >
        Next
        </button>
    </div>
  )
}