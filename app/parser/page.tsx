'use client'

import ParserInput from '@/components/ParserInput'
import Link from 'next/link'
import React from 'react'

type Props = object

export default function page({}: Props) {
  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4 mt-10 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-center">Input youre XG Position here</h1>
      <ParserInput />
      <button className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md cursor-pointer text-center">
        <Link href="/">
          <span className="text-white">Back to Home</span>
        </Link>
      </button>
    </div>
  )
}
