'use client'

import { loadUserLibrary } from '@/utils/userLibrary'
import Link from 'next/link'

export default function Home() {

  const userLibrary = loadUserLibrary()
  return (
      <div>
        <h1>Welcome to the Backgammon Gym</h1>

        <h2>Pick a category and start training</h2>
        {/* Filter categories */}
        <select>
          <option value="default">Default</option>
          <option value="weakest">Weakest first</option>
          <option value="longest">Longest untrained</option>
          <option value="recently">Recently trained</option>
          <option value="most">Most positions</option>
        </select>

        {/* Category Cards */}
        <h3>Default Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white rounded-lg shadow-md p-4">
          <div className="rounded-lg shadow-md p-4 bg-sky-50">
            <h3 className="text-lg font-bold">Category 1</h3>
            <p className="text-gray-600">10 positions</p>
          </div>
        </div>
        
        <h3>Your Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white rounded-lg shadow-md p-4">
        {userLibrary.library.map((category) => (
          <Link
            key={category.category.id}
            href={`/board?categoryId=${category.category.id}`}
          >
            <div className="rounded-lg shadow-md p-4 mb-4 bg-sky-50">
              <h3 className="text-lg font-bold">{category.category.name}</h3>
              <p className="text-gray-600">{category.positions.length} positions</p>
            </div>
          </Link>
        ))}
        {/* save position card */}
        <Link href='/parser'>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 cursor-pointer">
          <div className="rounded-lg shadow-md p-4 bg-sky-50">
            <h3 className="text-lg font-bold">+</h3>
            <p className="text-gray-600">Save positions</p>
          </div>
        </div>
        </Link>

        <Link href='/board'>Go to the Training Center</Link>
      </div>
        </div>
  )
}
