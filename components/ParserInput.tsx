import { getLastCategoryId, isCategoryNameTaken, loadUserLibrary, saveUserLibrary, setLastCategoryId } from '@/utils/userLibrary';
import { createBoardStateFromXgid } from '@/utils/xgid-parser';
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { getUserLibrary, insertCategory, insertPosition } from '@/utils/repository';
import { UserLibrary } from '@/types/board';

const SENTINEL = "__CREATE_NEW_CATEGORY__"


export default function ParserInput() {

  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  
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
  const [folders, setFolders] = useState<UserLibrary['library']>([])

  const sortedFolders = [...folders].sort((a, b) => a.category.name.localeCompare(b.category.name))

  //User data from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    // Unsubscribe from auth state changes on unmount
    return () => subscription.unsubscribe()
  }, [supabase])

  // Loading folders from Supabase or Localstorage
  useEffect(() => {
    async function loadFolders() {
      const library = await getUserLibrary(supabase, user)
      setFolders(library.library)
    }

    loadFolders()
  }, [user, supabase])
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("")
    setSuccess("")
    try {
      // Phase 1: XGID from xGammon parsen
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

        // Phase 2 & 3 saving
        // Guest: userLibrary from localStorage(only !user branch)
        const userLibrary = loadUserLibrary()

        // If category is not selected, create a new category
        if (categoryId === SENTINEL) {
          const newCategoryNameTrimmed: string = newCategoryName.trim()
          if (newCategoryNameTrimmed.length === 0) {
            setError("Category name cannot be empty")
            return
          }
          if (isCategoryNameTaken(folders.map(folder => folder.category), newCategoryNameTrimmed)) {
            setError("Category name already taken")
            return
          }

          const newId = crypto.randomUUID()

          // If user is logged in, insert category and position to Supabase
          if (user) {
            await insertCategory(supabase, user, { id: newId, name: newCategoryNameTrimmed })
            await insertPosition(supabase, user, newId, positionData)
            setLastCategoryId(newId)
            setNewCategoryName("")
            setCategoryId(newId)

          // If user is not logged in, insert category and position to localStorage
          } else {
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
          }      
          
        // If category is selected, insert position to Supabase
        } else {

          // If user is logged in, insert position to Supabase
          if (user) {
            await insertPosition(supabase, user, categoryId, positionData)
            setLastCategoryId(categoryId)

          // If user is not logged in, insert position to localStorage
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
        }

        // Reset input fields when successful
        setXgidValue("")
        setError("")
        setSuccess(`${positionData.analysisType} analysis saved successfully`)

        // Reload folders from Supabase
        const library = await getUserLibrary(supabase, user)
        setFolders(library.library)
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
    <div className="flex justify-center p-4">

      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-md space-y-4 border border-indigo-100">

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
