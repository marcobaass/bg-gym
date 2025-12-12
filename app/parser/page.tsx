'use client'

import ParserInput from '@/components/ParserInput'
import React from 'react'

type Props = {}

export default function page({}: Props) {
  return (
    <div>
      <h1>Input youre XG Position here</h1>
      <ParserInput />
    </div>
  )
}
