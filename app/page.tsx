'use client'

import { getCategoryAverageScorePerPosition, loadUserLibrary } from '@/utils/userLibrary'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {

  const [userLibrary, setUserLibrary] = useState(() => loadUserLibrary())

  return (
      <div className="p-4 max-w-7xl mx-auto space-y-4 mt-10">
        <h1 className="text-2xl font-bold">Welcome to the Backgammon Gym</h1>

        <h2 className="text-lg font-bold">Pick a category and start training</h2>
        {/* Filter categories */}
        <select className="border border-gray-300 px-2 py-1 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:outline-none transition duration-150 ease-in-out mb-4 focus:ring-indigo-500 focus:border-indigo-500">
          <option value="default">Default</option>
          <option value="weakest">Weakest first</option>
          <option value="longest">Longest untrained</option>
          <option value="recently">Recently trained</option>
          <option value="most">Most positions</option>
        </select>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold col-span-3">Default Categories</h3>
          <div className="rounded-lg shadow-md p-4 bg-sky-50">
            <h3 className="text-lg font-bold">Category 1</h3>
            <p className="text-gray-600">10 positions</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-bold col-span-3">Your Categories</h3>
        {userLibrary.library.map((category) => (
          <Link
            key={category.category.id}
            href={`/board?categoryId=${category.category.id}`}
          >
            <div className="rounded-lg shadow-md p-4 mb-4 bg-sky-50">
              <h3 className="text-lg font-bold">{category.category.name}</h3>
              <p className="text-gray-600">{getCategoryAverageScorePerPosition(category.category.id) ?? 0} / 6</p>
              <p className="text-gray-600">avg. last 10</p>
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
      </div>
      </div>
  )
}
