'use client'

import React from 'react';
import type { SessionsByCategory, UserLibrary } from '@/types/board';
import { getCategoryAverageScore, loadSessionHistory, loadUserLibrary, saveUserLibrary } from '@/utils/userLibrary'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import RatingDots from '@/components/stats/ratingDots'


function lastFinishedAtMs(
  sessionsByCategory: SessionsByCategory,
  categoryId: string
): number {
  const sessions = sessionsByCategory[categoryId] ?? [];
  if (sessions.length === 0) return -Infinity; // never trained
  return Math.max(...sessions.map((s) => s.finishedAt));
}

export default function Home() {

  const [userLibrary, setUserLibrary] = useState<UserLibrary>()
  const [sessionHistory, setSessionHistory] = useState<SessionsByCategory>({})
  const [selectedCategory, setSelectedCategory] = useState<string | null>('default')

  useEffect(() => {
    const userLibrary = loadUserLibrary()
    const sessionHistory = loadSessionHistory()
    setUserLibrary(userLibrary)
    setSessionHistory(sessionHistory)
  }, []);

  /**
   * Sorting category cards
   */
  const sortedCategories = [...userLibrary?.library ?? []];

  sortedCategories.sort((a, b) => {
    const nameTieBreak = () =>
      a.category.name.localeCompare(b.category.name, undefined, {
        sensitivity: "base",
      });
    switch (selectedCategory) {
      case "default":
        return nameTieBreak();
      case "weakest": {
        const primary =
          (getCategoryAverageScore(sessionHistory ?? {}, a.category.id) ?? 0) -
          (getCategoryAverageScore(sessionHistory ?? {}, b.category.id) ?? 0);
        if (primary !== 0) return primary;
        return nameTieBreak();
      }
      case "most": {
        const primary = b.positions.length - a.positions.length;
        if (primary !== 0) return primary;
        return nameTieBreak();
      }
      case "recently": {
        const aLast = lastFinishedAtMs(sessionHistory ?? {}, a.category.id);
        const bLast = lastFinishedAtMs(sessionHistory ?? {}, b.category.id);
        const primary = bLast - aLast; // more recent first
        if (primary !== 0) return primary;
        return nameTieBreak();
      }
      case "longest": {
        const aLast = lastFinishedAtMs(sessionHistory ?? {}, a.category.id);
        const bLast = lastFinishedAtMs(sessionHistory ?? {}, b.category.id);
        const primary = aLast - bLast; // older/smaller timestamp first (never-trained = -Infinity goes first)
        if (primary !== 0) return primary;
        return nameTieBreak();
      }
      default:
        return nameTieBreak();
    }
  });

  // todo: implement modal or dialog for confirmation instead of window.confirm
  const deleteCategory = (categoryId: string) => {
    if (window.confirm("Do you really want to delete this category?")) {
      const newUserLibrary = (userLibrary?.library ?? []).filter((c) => c.category.id !== categoryId)
      saveUserLibrary({ library: newUserLibrary })
      setUserLibrary({ library: newUserLibrary })
    }
  }

  return (
      <div className="p-4 max-w-7xl mx-auto space-y-4 mt-10">
        <h1 className="text-2xl font-bold">Welcome to the Backgammon Gym</h1>

        <h2 className="text-lg font-bold">Pick a category and start training</h2>        

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold col-span-3">Default Categories</h3>
          <div className="rounded-lg shadow-md p-4 bg-sky-50">
            <h3 className="text-lg font-bold">Category 1</h3>
            <p className="text-gray-600">10 positions</p>
          </div>
        </div>

        {/* Filter categories */}
        <select className="border border-gray-300 px-2 py-1 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:outline-none transition duration-150 ease-in-out mb-4 focus:ring-indigo-500 focus:border-indigo-500"
        value={selectedCategory ?? 'default'}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)

        }>
          <option value="default">Default</option>
          <option value="weakest">Weakest first</option>
          <option value="longest">Longest untrained</option>
          <option value="recently">Recently trained</option>
          <option value="most">Most positions</option>
        </select>

        {/* Show the filtered/sorted categories */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-bold col-span-3">Your Categories</h3>

        {sortedCategories.map((categories) => (
          <div
            key={categories.category.id}
            className="relative rounded-lg shadow-md p-4 mb-4 bg-sky-50"
          >
            <Link
              href={`/board?categoryId=${categories.category.id}`}
              className="block pr-7"
            >
              <h3 className="text-lg font-bold">{categories.category.name}</h3>
              <p className="text-gray-600">{(getCategoryAverageScore(sessionHistory ?? {}, categories.category.id) ?? 0).toFixed(1)} / 6</p>
              <p className="text-gray-600">avg. last 10</p>
              {/* dots component for avg. last 10 */}
              <RatingDots rating={sessionHistory[categories.category.id]} />
              <p className="text-gray-600">{categories.positions.length} positions</p>
            </Link>
            <button
              type="button"
              onClick={() => deleteCategory(categories.category.id)}
              className="absolute top-3 right-3 inline-flex items-center justify-center text-white hover:bg-red-700 w-5 h-5 text-xs cursor-pointer bg-red-500 rounded-sm"
              aria-label={`Delete category ${categories.category.name}`}
            >
              X
            </button>
          </div>
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
