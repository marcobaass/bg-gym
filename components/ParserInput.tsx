import { createBoardStateFromXgid } from '@/utils/xgid-parser';
import React, { useState } from 'react'

type Props = {}

export default function ParserInput({}: Props) {

  const[xgidValue, setXgidValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const positionData = createBoardStateFromXgid(xgidValue)
      // TODO: Use positionData for further processing (localStorage)
    } catch (error) {
      console.error('Failed to parse XG Position', error)
      // TODO: Display error message to user
    }
  }



  return (
    <div className="flex justify-center p-4 bg-gray-50">

      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-2xl space-y-4 border border-indigo-100">

        <div className="text-xl font-bold text-indigo-700 text-center">Position Input</div>

            <form onSubmit={handleSubmit}>
              <textarea
                rows={4}
                onChange={(e) => setXgidValue(e.target.value)}
                className="
                  w-full border border-gray-300 p-3 rounded-lg
                  text-gray-900 placeholder-gray-400
                  focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                  transition duration-150 ease-in-out
                "
                placeholder="Paste XG Position here ..."
              ></textarea>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md"
                disabled={!xgidValue.trim()}
              >
                Save analysis
              </button>
            </form>

      </div>
    </div>
  )
}
