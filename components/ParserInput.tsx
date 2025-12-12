import { createBoardStateFromXgid } from '@/utils/xgid-parser';
import React, { useState } from 'react'


export default function ParserInput() {

  const[xgidValue, setXgidValue] = useState("")
  const[error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("")

    try {
      const positionData = createBoardStateFromXgid(xgidValue)
      if (positionData.analysisType === 'Cube' || positionData.analysisType === 'Move') {
        console.log('Success');

        let showList = [];
        const show = positionData;
        showList.push(show);
        showList = showList.concat(JSON.parse(localStorage.getItem('showList')||'[]'));
        localStorage.setItem("showList", JSON.stringify(showList));

        setXgidValue("")
      } else {
        setError("This is not a correct Position")
      }
    } catch (error) {
      console.error('Failed to parse XG Position', error)
      setError("Failed to parse XG Position")
    }
  }



  return (
    <div className="flex justify-center p-4 bg-gray-50">

      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-2xl space-y-4 border border-indigo-100">

        <div className="text-xl font-bold text-indigo-700 text-center">Position Input</div>

            <form onSubmit={handleSubmit}>
              <textarea
                rows={4}
                value={xgidValue}
                onChange={(e) => {
                  setXgidValue(e.target.value)
                  setError("")
                }}
                className={`
                  w-full border border-gray-300 p-3 rounded-lg
                  text-gray-900 placeholder-gray-400
                  focus:ring-2 focus:outline-none
                  transition duration-150 ease-in-out
                  ${error
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }
                `}
                placeholder="Paste XG Position here ..."
              ></textarea>

              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}

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
