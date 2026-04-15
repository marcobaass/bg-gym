import { getLastCategoryId, isCategoryNameTaken, loadUserLibrary, saveUserLibrary, setLastCategoryId } from '@/utils/userLibrary';
import { createBoardStateFromXgid } from '@/utils/xgid-parser';
import React, { useState } from 'react'

const SENTINEL = "__CREATE_NEW_CATEGORY__"


export default function ParserInput() {
  
  const[xgidValue, setXgidValue] = useState("")
  const[error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState('Move')

  const [categoryId, setCategoryId] = useState(() => {
    if (typeof window === "undefined") return SENTINEL
    const lastId = getLastCategoryId()
    const initialFolders = loadUserLibrary().library
    const exists = lastId ? initialFolders.find((folder) => folder.category.id === lastId) : null
    return exists ? exists.category.id : SENTINEL
  })

  const [newCategoryName, setNewCategoryName] = useState("")

  const folders = loadUserLibrary().library
  const sortedFolders = [...folders].sort((a, b) => a.category.name.localeCompare(b.category.name))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("")
    setSuccess("")
    try {
      const positionData = createBoardStateFromXgid(xgidValue)

      // Check if position is valid
      if(!positionData) {
        setError("This is not a valid position")
        return
      }

      // Check if XGID is valid Move or Cube
      if(positionData.analysisType !== activeTab) {
        setError(`This is not a correct ${activeTab} Position`)
        return
      }

      // Check for forced move
      if (positionData.analysisType === 'Move' && positionData.bestMoves.length === 1) {
        setError("This is a forced move")
        return
      }

      if (positionData.analysisType === 'Cube' || positionData.analysisType === 'Move') {
        const userLibrary = loadUserLibrary()
        if (categoryId === SENTINEL) {
          const newCategoryNameTrimmed: string = newCategoryName.trim()
          if (newCategoryNameTrimmed.length === 0) {
            setError("Category name cannot be empty")
            return
          }
          if (isCategoryNameTaken(userLibrary.library.map(category => category.category), newCategoryNameTrimmed)) {
            setError("Category name already taken")
            return
          }

          const newId = crypto.randomUUID()
          userLibrary.library.push({
            category: {
              id: newId,
              name: newCategoryNameTrimmed,
            },
            positions: [positionData],
          })
          setLastCategoryId(newId)
          saveUserLibrary(userLibrary)
          setNewCategoryName("")
          setCategoryId(newId)
        } else {
          const category = userLibrary.library.find((category) => category.category.id === categoryId)
          if (category) {
            category.positions.push(positionData)
            setLastCategoryId(categoryId)
            saveUserLibrary(userLibrary)
          } else {
            setError("Category not found")
            return
          }
        }

        setXgidValue("")
        setError("")
        setSuccess(`${positionData.analysisType} analysis saved successfully`)
      } else {
        setError("This is not a correct Position")
      }
    } catch (error) {
      console.error('Failed to parse XG Position', error)
      setError("Failed to parse XG Position")
    }
  }

  const tabs = [
    { label: 'Move', value: 'Move' },
    { label: 'Cube', value: 'Cube' },
  ]


  const handleTabClick = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="flex justify-center p-4 bg-gray-50">

      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-2xl space-y-4 border border-indigo-100">

        <div className="text-xl font-bold text-indigo-700 text-center">Position Input</div>
            <form onSubmit={handleSubmit}>
              {/* Tabs */}
              <div className="mb-4 flex rounded-lg bg-indigo-50 p-1 ">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.value
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => handleTabClick(tab.value)}
                      className={[
                        "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                        isActive
                          ? "bg-white text-indigo-700 shadow"
                          : "text-indigo-600 hover:bg-indigo-100"
                      ].join(" ")}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
              
              <label htmlFor="xgidValue">
                <span className="block mb-2 text-sm font-medium text-gray-700">
                  {activeTab === 'Move' ? 'Move analysis XGID' : 'Cube analysis XGID'}
                </span>
              </label>

              <textarea
                id="xgidValue"
                rows={4}
                value={xgidValue}
                onChange={(e) => {
                  setXgidValue(e.target.value)
                  setError("")
                  setSuccess("")
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

              {/* Dropdown for category selection */}
              <label htmlFor="categorySelect">
                <span className="block mb-2 text-sm font-medium text-gray-700">
                  Category
                </span>
              </label>
              <select id="categorySelect" className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:outline-none transition duration-150 ease-in-out mb-4 focus:ring-indigo-500 focus:border-indigo-500" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value={SENTINEL}>Create new category</option>
                {sortedFolders.map((category) => {
                  return (
                    <option key={category.category.id} value={category.category.id}>
                      {category.category.name}
                    </option>
                  )
                })}
              </select>
              {categoryId === SENTINEL && (
                <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:outline-none transition duration-150 ease-in-out mb-4 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter new category name" />
              )}

              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}

              {success && (
                <p className="text-green-600 text-sm mt-2">{success}</p>
              )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md cursor-pointer"
              disabled={!xgidValue.trim()}
            >
              Save analysis
            </button>

            </form>

      </div>
    </div>
  )
}
