'use client'

import BoardRenderer from '@/components/BoardRenderer';
import { Position } from '@/types/board';
import React, { useState, useEffect } from 'react'

type Props = {}

export default function Board({}: Props) {
  const [positionData, setPositionData] = useState<Position[]>([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0)

  useEffect(() => {
    try {
      const showListString = localStorage.getItem("showList");
      if (showListString) {
        const parsedData = JSON.parse(showListString)
        setPositionData(parsedData)
      } else {
        console.log("No 'showList' data found in localStorage.");
      }

    } catch(error) {
      console.error("Error accessing or parsing localStorage data:", error);
    }

  }, [])

  console.log("Data loaded from localStorage:", positionData);

  return (
    <>
      <div>Welcome to the Training</div>

      {positionData.length > 0 ? (
        <>
          <div className="text-center mb-4">
            Position {currentPositionIndex + 1} of {positionData.length}
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
          </div>

          <BoardRenderer positionData={positionData[currentPositionIndex]} />
        </>
      ) : (
        <div>No positions available</div>
      )}
    </>
  )
}
